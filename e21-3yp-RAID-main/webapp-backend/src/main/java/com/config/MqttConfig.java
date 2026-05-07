package com.config;

import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.integration.core.MessageProducer;
import org.springframework.integration.mqtt.core.DefaultMqttPahoClientFactory;
import org.springframework.integration.mqtt.core.MqttPahoClientFactory;
import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
import org.springframework.integration.mqtt.support.DefaultPahoMessageConverter;
import org.springframework.messaging.MessageChannel;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;
import java.io.InputStream;
import java.security.KeyStore;

@Configuration
public class MqttConfig {

    @Value("${aws.iot.broker.url}")
    private String brokerUrl;

    @Value("${aws.iot.broker.clientId}")
    private String clientId;

    @Value("${aws.iot.topic.filter}")
    private String topicFilter;

    // 1. Configure the Connection Details This creates the connection configuration
    // to AWS IoT
    @Bean
    public MqttPahoClientFactory mqttClientFactory() {
        DefaultMqttPahoClientFactory factory = new DefaultMqttPahoClientFactory();
        MqttConnectOptions options = new MqttConnectOptions();

        options.setServerURIs(new String[] { brokerUrl });
        options.setCleanSession(true); // Do NOT store old messages and Start fresh every time backend connects
        options.setKeepAliveInterval(60);

        // CRITICAL: AWS IoT requires X.509 Certificates.
        // Attach the SSL Socket Factory using the certificate keys
        try {
            options.setSocketFactory(customSslSocketFactory());
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize SSL Socket Factory", e);
        }

        factory.setConnectionOptions(options);
        return factory;
    }

    /**
     * Unlocks the PKCS12 KeyStore and builds the secure SSL Context for AWS IoT
     * mTLS.
     */
    private SSLSocketFactory customSslSocketFactory() throws Exception {

        // 1. Point to the .p12 file inside your resources folder
        KeyStore keyStore = KeyStore.getInstance("PKCS12");

        // Use the classloader to find the file inside the Spring Boot .jar
        try (InputStream keystoreInput = getClass().getClassLoader().getResourceAsStream("backend-keystore.p12")) {
            if (keystoreInput == null) {
                throw new RuntimeException("Cannot find backend-keystore.p12 in resources folder!");
            }
            // 2. Unlock the vault using the password we set in the terminal
            keyStore.load(keystoreInput, "raid123".toCharArray());
        }

        // 3. Prepare the Key Manager
        KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
        keyManagerFactory.init(keyStore, "raid123".toCharArray());

        // 4. Build the SSL Context using standard TLSv1.2
        SSLContext context = SSLContext.getInstance("TLSv1.2");

        // We pass 'null' for the TrustManager because modern Java automatically trusts
        // the Amazon Root CA
        context.init(keyManagerFactory.getKeyManagers(), null, null);

        return context.getSocketFactory();
    }

    // 2. Create the internal "Pipe" where messages will be dropped. AWS IoT →
    // Adapter → Channel → Your Service
    @Bean
    public MessageChannel mqttInputChannel() {
        return new DirectChannel();
    }

    // 3. The Adapter: Listens to AWS and pushes data into our pipe
    @Bean
    public MessageProducer inbound() {
        MqttPahoMessageDrivenChannelAdapter adapter = new MqttPahoMessageDrivenChannelAdapter(clientId,
                mqttClientFactory(), topicFilter);

        adapter.setCompletionTimeout(5000);
        adapter.setConverter(new DefaultPahoMessageConverter());
        adapter.setQos(1); // Match the QoS 1 you use on the hardware
        adapter.setOutputChannel(mqttInputChannel());
        return adapter;
    }
}