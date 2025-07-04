#!/usr/bin/env python3
"""
Script to fix PostgreSQL compatibility issues in SQL dump files.
Removes the transaction_timeout parameter that's not supported in PostgreSQL < 14.
"""

import sys
import os

def fix_sql_file(input_file_path):
    """Fix PostgreSQL compatibility issues in the SQL file."""
    
    if not os.path.exists(input_file_path):
        print(f"Error: File '{input_file_path}' not found.")
        return False
    
    # Create backup
    backup_path = input_file_path + '.backup'
    try:
        with open(input_file_path, 'r', encoding='utf-8') as original:
            with open(backup_path, 'w', encoding='utf-8') as backup:
                backup.write(original.read())
        print(f"Backup created: {backup_path}")
    except Exception as e:
        print(f"Error creating backup: {e}")
        return False
    
    # Fix the file
    try:
        with open(input_file_path, 'r', encoding='utf-8') as file:
            lines = file.readlines()
        
        fixed_lines = []
        changes_made = 0
        
        for line in lines:
            if 'SET transaction_timeout' in line:
                # Comment out the problematic line
                fixed_lines.append('-- ' + line)
                changes_made += 1
                print(f"Fixed line: {line.strip()}")
            else:
                fixed_lines.append(line)
        
        # Write the fixed file
        with open(input_file_path, 'w', encoding='utf-8') as file:
            file.writelines(fixed_lines)
        
        if changes_made > 0:
            print(f"Successfully fixed {changes_made} compatibility issue(s).")
            print(f"The file '{input_file_path}' has been updated.")
        else:
            print("No compatibility issues found.")
        
        return True
        
    except Exception as e:
        print(f"Error processing file: {e}")
        # Restore from backup if something went wrong
        try:
            with open(backup_path, 'r', encoding='utf-8') as backup:
                with open(input_file_path, 'w', encoding='utf-8') as original:
                    original.write(backup.read())
            print("File restored from backup due to error.")
        except:
            print("Could not restore from backup!")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python fix_sql_compatibility.py <path_to_sql_file>")
        print("Example: python fix_sql_compatibility.py c:/Users/Gebruiker/Downloads/stayhaven3.sql")
        sys.exit(1)
    
    sql_file_path = sys.argv[1]
    success = fix_sql_file(sql_file_path)
    
    if success:
        print("\nFile fixed successfully! You can now import it into PostgreSQL.")
    else:
        print("\nFailed to fix the file. Please check the error messages above.")
        sys.exit(1) 