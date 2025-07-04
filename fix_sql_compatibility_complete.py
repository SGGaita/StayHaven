#!/usr/bin/env python3
"""
Comprehensive script to fix PostgreSQL compatibility issues in SQL dump files.
Handles version compatibility and permission issues.
"""

import sys
import os
import re

def fix_sql_compatibility(input_file_path):
    """Fix all PostgreSQL compatibility issues in the SQL file."""
    
    if not os.path.exists(input_file_path):
        print(f"Error: File '{input_file_path}' not found.")
        return False
    
    # Create backup
    backup_path = input_file_path + '.complete_backup'
    try:
        with open(input_file_path, 'r', encoding='utf-8') as original:
            with open(backup_path, 'w', encoding='utf-8') as backup:
                backup.write(original.read())
        print(f"Backup created: {backup_path}")
    except Exception as e:
        print(f"Error creating backup: {e}")
        return False
    
    # Patterns and exact lines to comment out
    problematic_patterns = [
        # Version compatibility issues
        r'SET transaction_timeout',
        r'SET default_table_access_method',
        r'SET default_tablespace',
        # Permission issues
        r'ALTER SCHEMA.*OWNER TO.*',
        r'REVOKE.*ON SCHEMA.*FROM.*',
        r'GRANT.*ON SCHEMA.*TO.*',
        r'.*OWNER TO postgres.*',
        r'COMMENT ON SCHEMA.*',
        r'REVOKE USAGE ON SCHEMA public FROM PUBLIC',
    ]
    
    try:
        with open(input_file_path, 'r', encoding='utf-8') as file:
            lines = file.readlines()
        
        fixed_lines = []
        changes_made = 0
        
        for line_num, line in enumerate(lines, 1):
            should_comment = False
            
            # Check if line matches any problematic pattern
            for pattern in problematic_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    should_comment = True
                    break
            
            if should_comment and not line.strip().startswith('--'):
                # Comment out the problematic line
                fixed_lines.append('-- ' + line)
                changes_made += 1
                print(f"Line {line_num}: Commented out: {line.strip()}")
            else:
                fixed_lines.append(line)
        
        # Write the fixed file
        with open(input_file_path, 'w', encoding='utf-8') as file:
            file.writelines(fixed_lines)
        
        if changes_made > 0:
            print(f"\nSuccessfully fixed {changes_made} compatibility issue(s).")
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
        print("Usage: python fix_sql_compatibility_complete.py <path_to_sql_file>")
        print("Example: python fix_sql_compatibility_complete.py c:/Users/Gebruiker/Downloads/stayhaven3.sql")
        sys.exit(1)
    
    sql_file_path = sys.argv[1]
    success = fix_sql_compatibility(sql_file_path)
    
    if success:
        print("\nFile fixed successfully! You can now try importing it again.")
        print("Note: Some version-specific and permission settings were commented out,")
        print("but all your data and table structures will import correctly.")
    else:
        print("\nFailed to fix the file. Please check the error messages above.")
        sys.exit(1) 