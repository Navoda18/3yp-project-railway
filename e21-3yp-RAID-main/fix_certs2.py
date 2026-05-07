import re
cpp = open('src/main.cpp', 'r', encoding='utf-8').read()
def w(f, r):
    m = re.search(r, cpp, re.S)
    if m: open('src/'+f, 'w', encoding='utf-8').write(m.group(1).strip()+'\n')
w('AmazonRootCA1.pem', r'AWS_CERT_CA\[\] = R"EOF\(
(.*?)\)EOF"')
w('certificate.pem.crt', r'AWS_CERT_CRT\[\] = R"EOF\(
(.*?)\)EOF"')
w('private.pem.key', r'AWS_CERT_PRIVATE\[\] = R"EOF\(
(.*?)\)EOF"')
