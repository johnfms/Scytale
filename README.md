# 🔐 Scytale Cipher Web Project

Welcome to the **Modern Scytale Cipher** project! This tool provides an interactive web-based implementation of the ancient Scytale cipher, supporting encryption and decryption of text and files, along with program and ransomware modes for advanced study purposes.

---

## 🌟 Features

- 📜 **Text Mode**: Encrypt and decrypt text using the Scytale cipher.
- 📁 **File Mode**: Encrypt or decrypt files of any type (`.txt`, `.jpg`, `.pdf`, etc.).
- 💻 **Program Mode**: Generate Python scripts for encryption and decryption.
- ☠️ **Ransomware Mode**: Study ransomware encryption for ethical research and recovery methods.
- 🎨 Visualize the Scytale grid as the cipher operates.

---

## 📂 Project Structure

```
📁 scytale-cipher-web
├── index.html          # Main HTML interface
├── styles.css          # Styling for the interface
├── script.js           # JavaScript logic for the cipher and UI
└── README.md           # Project documentation
```

---

## 🚀 Getting Started


### 🌐 Run the Application
Open `index.html` in your browser.

---

## 🧠 How the Cipher Works

The Scytale Cipher arranges the plaintext in rows, then reads down columns to create the ciphertext.

Example:
```
Plaintext:  HELLO_WORLD
Columns:    3
Grid:
H L W
E O O
L _ R
L D
Ciphertext: HLWEOL_LRLD
```

Decryption reverses this process to recover the original text.

---

## 📖 References
- [Scytale Cipher - Wikipedia](https://en.wikipedia.org/wiki/Scytale)
- Web cryptography APIs

---

## 👨‍💻 Author
**John Fawzy**  
---

✅ **Note**: This project is intended for **educational purposes only**. The ransomware mode exists to help understand and counteract file-encrypting malware.
