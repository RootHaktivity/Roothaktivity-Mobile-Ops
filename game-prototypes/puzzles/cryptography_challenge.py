#!/usr/bin/env python3
"""
Cryptography Challenge Prototype for Roothaktivity: Mobile Ops
Educational cryptography puzzles with realistic scenarios
"""

import random
import string
import base64
import hashlib
import time
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import json

class CipherType(Enum):
    CAESAR = "caesar"
    SUBSTITUTION = "substitution"
    VIGENERE = "vigenere"
    BASE64 = "base64"
    ROT13 = "rot13"
    XOR = "xor"
    MORSE = "morse"
    BINARY = "binary"
    HEX = "hex"
    REVERSE = "reverse"

class Difficulty(Enum):
    BEGINNER = 1
    INTERMEDIATE = 2
    ADVANCED = 3
    EXPERT = 4

@dataclass
class Challenge:
    id: str
    title: str
    description: str
    cipher_type: CipherType
    difficulty: Difficulty
    plaintext: str
    ciphertext: str
    key: Optional[str]
    hint: str
    solution_steps: List[str]
    points: int

class CryptographyPuzzleEngine:
    """Engine for generating and solving cryptography puzzles"""
    
    def __init__(self):
        self.morse_code = {
            'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
            'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
            'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
            'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
            'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
            '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
            '8': '---..', '9': '----.', ' ': '/'
        }
        
        self.reverse_morse = {v: k for k, v in self.morse_code.items()}
        
        # Common words for generating realistic messages
        self.secret_messages = [
            "THE PACKAGE IS HIDDEN IN THE BASEMENT",
            "MEET AT THE OLD WAREHOUSE AT MIDNIGHT",
            "PASSWORD IS ADMIN123",
            "SERVER CREDENTIALS ARE IN THE SAFE",
            "ACCESS CODE IS SEVEN SEVEN NINE TWO",
            "OPERATION BLACKBIRD IS COMPROMISED",
            "EXTRACT TARGET BEFORE DAWN",
            "DATABASE PASSWORD IS QWERTY789",
            "BACKDOOR IS ACTIVE ON PORT 4444",
            "ENCRYPTION KEY IS ALPHA BRAVO CHARLIE"
        ]
        
        self.challenges_completed = []
        
    def generate_challenge(self, difficulty: Difficulty = None, cipher_type: CipherType = None) -> Challenge:
        """Generate a random cryptography challenge"""
        if not difficulty:
            difficulty = random.choice(list(Difficulty))
        
        if not cipher_type:
            # Select cipher type based on difficulty
            beginner_ciphers = [CipherType.CAESAR, CipherType.ROT13, CipherType.REVERSE, CipherType.BASE64]
            intermediate_ciphers = [CipherType.SUBSTITUTION, CipherType.VIGENERE, CipherType.XOR, CipherType.MORSE]
            advanced_ciphers = [CipherType.BINARY, CipherType.HEX]
            
            if difficulty == Difficulty.BEGINNER:
                cipher_type = random.choice(beginner_ciphers)
            elif difficulty == Difficulty.INTERMEDIATE:
                cipher_type = random.choice(intermediate_ciphers)
            elif difficulty == Difficulty.ADVANCED:
                cipher_type = random.choice(advanced_ciphers)
            else:  # EXPERT
                cipher_type = random.choice(list(CipherType))
        
        plaintext = random.choice(self.secret_messages)
        challenge_id = f"{cipher_type.value}_{int(time.time())}"
        
        # Generate challenge based on cipher type
        if cipher_type == CipherType.CAESAR:
            return self._generate_caesar_challenge(challenge_id, plaintext, difficulty)
        elif cipher_type == CipherType.SUBSTITUTION:
            return self._generate_substitution_challenge(challenge_id, plaintext, difficulty)
        elif cipher_type == CipherType.VIGENERE:
            return self._generate_vigenere_challenge(challenge_id, plaintext, difficulty)
        elif cipher_type == CipherType.BASE64:
            return self._generate_base64_challenge(challenge_id, plaintext, difficulty)
        elif cipher_type == CipherType.ROT13:
            return self._generate_rot13_challenge(challenge_id, plaintext, difficulty)
        elif cipher_type == CipherType.XOR:
            return self._generate_xor_challenge(challenge_id, plaintext, difficulty)
        elif cipher_type == CipherType.MORSE:
            return self._generate_morse_challenge(challenge_id, plaintext, difficulty)
        elif cipher_type == CipherType.BINARY:
            return self._generate_binary_challenge(challenge_id, plaintext, difficulty)
        elif cipher_type == CipherType.HEX:
            return self._generate_hex_challenge(challenge_id, plaintext, difficulty)
        elif cipher_type == CipherType.REVERSE:
            return self._generate_reverse_challenge(challenge_id, plaintext, difficulty)
    
    def _generate_caesar_challenge(self, challenge_id: str, plaintext: str, difficulty: Difficulty) -> Challenge:
        """Generate Caesar cipher challenge"""
        shift = random.randint(1, 25)
        ciphertext = self._caesar_encrypt(plaintext, shift)
        
        return Challenge(
            id=challenge_id,
            title="Caesar Cipher Intercept",
            description="You've intercepted an encrypted message. The sender appears to be using a simple substitution cipher where each letter is shifted by a fixed amount.",
            cipher_type=CipherType.CAESAR,
            difficulty=difficulty,
            plaintext=plaintext,
            ciphertext=ciphertext,
            key=str(shift),
            hint=f"Try shifting each letter by {shift} positions in the alphabet" if difficulty == Difficulty.BEGINNER else "This is a Caesar cipher - each letter is shifted by the same amount",
            solution_steps=[
                "Identify this as a Caesar cipher",
                "Try different shift values",
                f"Use shift value of {shift}",
                "Decrypt the message"
            ],
            points=difficulty.value * 50
        )
    
    def _generate_substitution_challenge(self, challenge_id: str, plaintext: str, difficulty: Difficulty) -> Challenge:
        """Generate substitution cipher challenge"""
        alphabet = string.ascii_uppercase
        shuffled = list(alphabet)
        random.shuffle(shuffled)
        substitution_key = dict(zip(alphabet, shuffled))
        
        ciphertext = ''.join(substitution_key.get(c.upper(), c) for c in plaintext)
        
        return Challenge(
            id=challenge_id,
            title="Substitution Cipher Mystery",
            description="This message uses a monoalphabetic substitution cipher. Each letter is consistently replaced with another letter.",
            cipher_type=CipherType.SUBSTITUTION,
            difficulty=difficulty,
            plaintext=plaintext,
            ciphertext=ciphertext,
            key=json.dumps(substitution_key),
            hint="Look for common patterns and letter frequencies. 'E' is the most common letter in English.",
            solution_steps=[
                "Analyze letter frequency",
                "Look for common words like 'THE' or 'AND'",
                "Map substitutions consistently",
                "Fill in the remaining letters"
            ],
            points=difficulty.value * 75
        )
    
    def _generate_vigenere_challenge(self, challenge_id: str, plaintext: str, difficulty: Difficulty) -> Challenge:
        """Generate Vigenère cipher challenge"""
        keys = ["SECRET", "CIPHER", "CRYPTO", "HACKER", "DECODE"]
        key = random.choice(keys)
        ciphertext = self._vigenere_encrypt(plaintext, key)
        
        return Challenge(
            id=challenge_id,
            title="Vigenère Cipher Challenge",
            description="This message is encrypted with a polyalphabetic substitution cipher using a repeating keyword.",
            cipher_type=CipherType.VIGENERE,
            difficulty=difficulty,
            plaintext=plaintext,
            ciphertext=ciphertext,
            key=key,
            hint=f"The keyword is '{key}'" if difficulty == Difficulty.BEGINNER else "Look for repeating patterns to find the key length",
            solution_steps=[
                "Determine the key length",
                "Find the keyword through frequency analysis",
                f"Use keyword '{key}'",
                "Decrypt using Vigenère table"
            ],
            points=difficulty.value * 100
        )
    
    def _generate_base64_challenge(self, challenge_id: str, plaintext: str, difficulty: Difficulty) -> Challenge:
        """Generate Base64 challenge"""
        ciphertext = base64.b64encode(plaintext.encode()).decode()
        
        return Challenge(
            id=challenge_id,
            title="Base64 Encoded Data",
            description="You've found what appears to be Base64 encoded data. This encoding is commonly used to represent binary data in text format.",
            cipher_type=CipherType.BASE64,
            difficulty=difficulty,
            plaintext=plaintext,
            ciphertext=ciphertext,
            key=None,
            hint="Base64 encoding uses A-Z, a-z, 0-9, +, / and = for padding",
            solution_steps=[
                "Recognize Base64 encoding",
                "Use Base64 decoder",
                "Retrieve original message"
            ],
            points=difficulty.value * 25
        )
    
    def _generate_rot13_challenge(self, challenge_id: str, plaintext: str, difficulty: Difficulty) -> Challenge:
        """Generate ROT13 challenge"""
        ciphertext = self._rot13_encrypt(plaintext)
        
        return Challenge(
            id=challenge_id,
            title="ROT13 Encoded Message",
            description="This message appears to be using ROT13, a simple letter substitution cipher that replaces each letter with the letter 13 positions after it.",
            cipher_type=CipherType.ROT13,
            difficulty=difficulty,
            plaintext=plaintext,
            ciphertext=ciphertext,
            key="13",
            hint="ROT13 is a special case of Caesar cipher with shift 13",
            solution_steps=[
                "Recognize ROT13 encoding",
                "Apply ROT13 transformation",
                "Retrieve original message"
            ],
            points=difficulty.value * 30
        )
    
    def _generate_xor_challenge(self, challenge_id: str, plaintext: str, difficulty: Difficulty) -> Challenge:
        """Generate XOR cipher challenge"""
        key = random.choice(["KEY", "XOR", "SECRET", "HACK"])
        ciphertext = self._xor_encrypt(plaintext, key)
        
        return Challenge(
            id=challenge_id,
            title="XOR Cipher Puzzle",
            description="This data has been encrypted using XOR cipher with a repeating key. XOR is commonly used in cryptography and malware obfuscation.",
            cipher_type=CipherType.XOR,
            difficulty=difficulty,
            plaintext=plaintext,
            ciphertext=ciphertext,
            key=key,
            hint=f"The XOR key is '{key}'" if difficulty == Difficulty.BEGINNER else "Try common keys like 'KEY', 'XOR', 'SECRET'",
            solution_steps=[
                "Understand XOR operation",
                "Try different key lengths",
                f"Use key '{key}'",
                "XOR the ciphertext with the key"
            ],
            points=difficulty.value * 80
        )
    
    def _generate_morse_challenge(self, challenge_id: str, plaintext: str, difficulty: Difficulty) -> Challenge:
        """Generate Morse code challenge"""
        ciphertext = self._morse_encrypt(plaintext)
        
        return Challenge(
            id=challenge_id,
            title="Morse Code Transmission",
            description="You've intercepted what appears to be a Morse code transmission. Dots and dashes represent letters and numbers.",
            cipher_type=CipherType.MORSE,
            difficulty=difficulty,
            plaintext=plaintext,
            ciphertext=ciphertext,
            key=None,
            hint="Morse code uses dots (.) and dashes (-). Spaces separate words (/).",
            solution_steps=[
                "Recognize Morse code patterns",
                "Use Morse code table",
                "Translate dots and dashes to letters",
                "Reconstruct the message"
            ],
            points=difficulty.value * 60
        )
    
    def _generate_binary_challenge(self, challenge_id: str, plaintext: str, difficulty: Difficulty) -> Challenge:
        """Generate binary challenge"""
        ciphertext = ' '.join(format(ord(c), '08b') for c in plaintext)
        
        return Challenge(
            id=challenge_id,
            title="Binary Data Analysis",
            description="You've found binary data that might contain a hidden message. Each 8-bit sequence represents an ASCII character.",
            cipher_type=CipherType.BINARY,
            difficulty=difficulty,
            plaintext=plaintext,
            ciphertext=ciphertext,
            key=None,
            hint="Convert each 8-bit binary number to its ASCII character equivalent",
            solution_steps=[
                "Recognize binary representation",
                "Group bits into 8-bit chunks",
                "Convert each group to ASCII",
                "Reconstruct the message"
            ],
            points=difficulty.value * 70
        )
    
    def _generate_hex_challenge(self, challenge_id: str, plaintext: str, difficulty: Difficulty) -> Challenge:
        """Generate hexadecimal challenge"""
        ciphertext = ' '.join(format(ord(c), '02x') for c in plaintext)
        
        return Challenge(
            id=challenge_id,
            title="Hexadecimal Dump",
            description="This appears to be a hexadecimal dump of data. Each pair of hex digits represents an ASCII character.",
            cipher_type=CipherType.HEX,
            difficulty=difficulty,
            plaintext=plaintext,
            ciphertext=ciphertext,
            key=None,
            hint="Convert each pair of hexadecimal digits to its ASCII character",
            solution_steps=[
                "Recognize hexadecimal format",
                "Group hex digits in pairs",
                "Convert each pair to ASCII",
                "Reconstruct the message"
            ],
            points=difficulty.value * 65
        )
    
    def _generate_reverse_challenge(self, challenge_id: str, plaintext: str, difficulty: Difficulty) -> Challenge:
        """Generate reverse cipher challenge"""
        ciphertext = plaintext[::-1]
        
        return Challenge(
            id=challenge_id,
            title="Reverse Engineering",
            description="This message has been scrambled in a simple way. Sometimes the simplest approaches work best.",
            cipher_type=CipherType.REVERSE,
            difficulty=difficulty,
            plaintext=plaintext,
            ciphertext=ciphertext,
            key=None,
            hint="Try reading the message backwards",
            solution_steps=[
                "Try simple transformations",
                "Reverse the entire string",
                "Check if it makes sense"
            ],
            points=difficulty.value * 20
        )
    
    # Encryption methods
    def _caesar_encrypt(self, text: str, shift: int) -> str:
        """Encrypt text using Caesar cipher"""
        result = ""
        for char in text:
            if char.isalpha():
                ascii_offset = 65 if char.isupper() else 97
                result += chr((ord(char) - ascii_offset + shift) % 26 + ascii_offset)
            else:
                result += char
        return result
    
    def _vigenere_encrypt(self, text: str, key: str) -> str:
        """Encrypt text using Vigenère cipher"""
        result = ""
        key_index = 0
        for char in text:
            if char.isalpha():
                shift = ord(key[key_index % len(key)].upper()) - 65
                ascii_offset = 65 if char.isupper() else 97
                result += chr((ord(char) - ascii_offset + shift) % 26 + ascii_offset)
                key_index += 1
            else:
                result += char
        return result
    
    def _rot13_encrypt(self, text: str) -> str:
        """Encrypt text using ROT13"""
        return self._caesar_encrypt(text, 13)
    
    def _xor_encrypt(self, text: str, key: str) -> str:
        """Encrypt text using XOR cipher"""
        result = ""
        for i, char in enumerate(text):
            result += chr(ord(char) ^ ord(key[i % len(key)]))
        return base64.b64encode(result.encode()).decode()
    
    def _morse_encrypt(self, text: str) -> str:
        """Convert text to Morse code"""
        return ' '.join(self.morse_code.get(c.upper(), c) for c in text)
    
    # Decryption methods
    def solve_challenge(self, challenge: Challenge, user_solution: str) -> Tuple[bool, str]:
        """Check if the user's solution is correct"""
        correct_solution = challenge.plaintext.upper().replace(" ", "")
        user_solution_clean = user_solution.upper().replace(" ", "")
        
        is_correct = correct_solution == user_solution_clean
        
        if is_correct:
            feedback = f"Correct! You've successfully decrypted the {challenge.cipher_type.value} cipher."
            self.challenges_completed.append(challenge.id)
        else:
            feedback = f"Incorrect. The correct answer was: '{challenge.plaintext}'"
        
        return is_correct, feedback
    
    def get_hint(self, challenge: Challenge) -> str:
        """Get a hint for the challenge"""
        return challenge.hint
    
    def get_solution_steps(self, challenge: Challenge) -> List[str]:
        """Get step-by-step solution for the challenge"""
        return challenge.solution_steps
    
    def caesar_decrypt(self, ciphertext: str, shift: int) -> str:
        """Decrypt Caesar cipher"""
        return self._caesar_encrypt(ciphertext, -shift)
    
    def vigenere_decrypt(self, ciphertext: str, key: str) -> str:
        """Decrypt Vigenère cipher"""
        result = ""
        key_index = 0
        for char in ciphertext:
            if char.isalpha():
                shift = ord(key[key_index % len(key)].upper()) - 65
                ascii_offset = 65 if char.isupper() else 97
                result += chr((ord(char) - ascii_offset - shift) % 26 + ascii_offset)
                key_index += 1
            else:
                result += char
        return result
    
    def xor_decrypt(self, ciphertext: str, key: str) -> str:
        """Decrypt XOR cipher"""
        try:
            decoded = base64.b64decode(ciphertext).decode()
            result = ""
            for i, char in enumerate(decoded):
                result += chr(ord(char) ^ ord(key[i % len(key)]))
            return result
        except:
            return "Invalid XOR ciphertext"
    
    def morse_decrypt(self, ciphertext: str) -> str:
        """Decrypt Morse code"""
        words = ciphertext.split(' / ')
        result = []
        for word in words:
            letters = word.split(' ')
            decoded_word = ''.join(self.reverse_morse.get(letter, '?') for letter in letters if letter)
            result.append(decoded_word)
        return ' '.join(result)
    
    def frequency_analysis(self, text: str) -> Dict[str, float]:
        """Perform frequency analysis on text"""
        text = text.upper()
        letter_count = {}
        total_letters = 0
        
        for char in text:
            if char.isalpha():
                letter_count[char] = letter_count.get(char, 0) + 1
                total_letters += 1
        
        frequencies = {}
        for letter, count in letter_count.items():
            frequencies[letter] = (count / total_letters) * 100
        
        return dict(sorted(frequencies.items(), key=lambda x: x[1], reverse=True))

def main():
    """Demo the cryptography puzzle engine"""
    engine = CryptographyPuzzleEngine()
    
    print("🔐 Roothaktivity: Cryptography Challenge Lab")
    print("=" * 50)
    
    # Generate challenges of different difficulties
    difficulties = [Difficulty.BEGINNER, Difficulty.INTERMEDIATE, Difficulty.ADVANCED]
    
    for difficulty in difficulties:
        print(f"\n📊 {difficulty.name} LEVEL CHALLENGES")
        print("-" * 30)
        
        for i in range(2):  # Generate 2 challenges per difficulty
            challenge = engine.generate_challenge(difficulty)
            
            print(f"\n🎯 Challenge: {challenge.title}")
            print(f"📝 Description: {challenge.description}")
            print(f"🔢 Difficulty: {challenge.difficulty.name}")
            print(f"💎 Points: {challenge.points}")
            print(f"🔤 Ciphertext: {challenge.ciphertext}")
            
            # Show hint for demonstration
            if random.random() < 0.5:  # 50% chance to show hint
                print(f"💡 Hint: {challenge.hint}")
            
            # Simulate solving
            is_correct, feedback = engine.solve_challenge(challenge, challenge.plaintext)
            print(f"✅ Solution: {challenge.plaintext}")
            print(f"📋 Feedback: {feedback}")
            
            time.sleep(1)  # Pause for readability
    
    # Demo cryptanalysis tools
    print(f"\n🔍 CRYPTANALYSIS TOOLS DEMO")
    print("-" * 30)
    
    sample_text = "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG"
    encrypted = engine._caesar_encrypt(sample_text, 7)
    
    print(f"Original: {sample_text}")
    print(f"Encrypted (Caesar +7): {encrypted}")
    
    # Frequency analysis
    frequencies = engine.frequency_analysis(encrypted)
    print(f"Letter frequencies in ciphertext:")
    for letter, freq in list(frequencies.items())[:5]:  # Top 5
        print(f"  {letter}: {freq:.1f}%")
    
    # Try all Caesar shifts
    print(f"\nTrying all Caesar cipher shifts:")
    for shift in range(1, 26):
        decrypted = engine.caesar_decrypt(encrypted, shift)
        if "THE" in decrypted and "QUICK" in decrypted:
            print(f"  Shift {shift}: {decrypted} ✅")
            break
        elif shift <= 5:  # Show first few attempts
            print(f"  Shift {shift}: {decrypted}")
    
    print(f"\n🏆 Total challenges completed: {len(engine.challenges_completed)}")

if __name__ == "__main__":
    main()