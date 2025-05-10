import pandas as pd
import csv
def fix_csv_with_pandas(input_file, output_file):
    try:
        # Read with error-tolerant parsing
        df = pd.read_csv(input_file, 
                        header=None, 
                        encoding='utf-8', 
                        quotechar='"',
                        on_bad_lines='warn')  # Changed from error_bad_lines
        
        # Save with consistent quoting
        df.to_csv(output_file, 
                 index=False, 
                 header=False, 
                 quoting=csv.QUOTE_ALL)  # Quote all fields
        
        print(f"File processed successfully. Corrected file saved as {output_file}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        print("Trying alternative method...")
        fix_csv_alternative_method(input_file, output_file)

def fix_csv_alternative_method(input_file, output_file):
    """Fallback method if pandas approach fails"""
    import csv
    
    with open(input_file, 'r', encoding='utf-8') as infile:
        reader = csv.reader(infile, quotechar='"')
        rows = list(reader)
    
    with open(output_file, 'w', newline='', encoding='utf-8') as outfile:
        writer = csv.writer(outfile, quoting=csv.QUOTE_ALL)
        writer.writerows(rows)
    
    print(f"File processed with alternative method. Corrected file saved as {output_file}")

# Example usage
input_filename = 'backend\data\josaa_cutoffs_2024.csv'  # Replace with your input file name
output_filename = 'corrected_output.csv'  # Replace with your desired output file name

fix_csv_with_pandas(input_filename, output_filename)
