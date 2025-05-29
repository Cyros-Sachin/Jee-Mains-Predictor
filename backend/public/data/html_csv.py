# # import pandas as pd
# # import csv
# # def fix_csv_with_pandas(input_file, output_file):
# #     try:
# #         # Read with error-tolerant parsing
# #         df = pd.read_csv(input_file, 
# #                         header=None, 
# #                         encoding='utf-8', 
# #                         quotechar='"',
# #                         on_bad_lines='warn')  # Changed from error_bad_lines
        
# #         # Save with consistent quoting
# #         df.to_csv(output_file, 
# #                  index=False, 
# #                  header=False, 
# #                  quoting=csv.QUOTE_ALL)  # Quote all fields
        
# #         print(f"File processed successfully. Corrected file saved as {output_file}")
# #     except Exception as e:
# #         print(f"An error occurred: {str(e)}")
# #         print("Trying alternative method...")
# #         fix_csv_alternative_method(input_file, output_file)

# # def fix_csv_alternative_method(input_file, output_file):
# #     """Fallback method if pandas approach fails"""
# #     import csv
    
# #     with open(input_file, 'r', encoding='utf-8') as infile:
# #         reader = csv.reader(infile, quotechar='"')
# #         rows = list(reader)
    
# #     with open(output_file, 'w', newline='', encoding='utf-8') as outfile:
# #         writer = csv.writer(outfile, quoting=csv.QUOTE_ALL)
# #         writer.writerows(rows)
    
# #     print(f"File processed with alternative method. Corrected file saved as {output_file}")

# # # Example usage
# # input_filename = 'backend\data\josaa_cutoffs_2024.csv'  # Replace with your input file name
# # output_filename = 'corrected_output.csv'  # Replace with your desired output file name

# # fix_csv_with_pandas(input_filename, output_filename)

# # import pandas as pd

# # # Load CSV
# # df = pd.read_csv('josaa_cutoffs_2024.csv')

# # # Get unique entries of a column, e.g., 'city'
# # unique_values = df['Academic Program Name'].unique()
# # print(unique_values)

# # Read raw text
# # with open("options.txt", "r", encoding="utf-8") as f:
# #     data = f.read()

# # # Clean the data
# # # 1. Remove any line breaks and excess whitespace
# # data = data.replace('\n', '').replace('\r', '').strip()

# # # 2. Split by single quote + comma or just quote close
# # import re
# # entries = re.findall(r"'([^']+)'", data)

# # # 3. Get unique values
# # unique_entries = sorted(set(entries))

# # # 4. Print or save the result
# # for entry in unique_entries:
# #     print(entry)

# import json

# # Step 1: Read the raw data from the file
# with open("backend\public\data\options.txt", "r", encoding="utf-8") as f:
#     raw_data = f.read()

# # Step 2: Clean and extract entries manually
# # Split by single quote, then filter valid entries
# entries = raw_data.split("'")
# filtered = [entry.strip() for entry in entries if (
#     entry.strip() != '' and
#     not entry.strip().startswith('[') and
#     not entry.strip().endswith(']') and
#     not entry.strip().isspace()
# )]

# # Step 3: Deduplicate and sort
# unique_entries = sorted(set(filtered))

# # Step 4: Format for react-select
# branch_options = [{"label": entry, "value": entry} for entry in unique_entries]

# # Step 5: Save to JSON
# with open("branchOptions.json", "w", encoding="utf-8") as f:
#     json.dump(branch_options, f, indent=2, ensure_ascii=False)

# print(f"✅ Done! {len(branch_options)} unique entries written to branchOptions.json.")
