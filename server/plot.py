import sys
import pandas as pd
import matplotlib.pyplot as plt

def process_file(file_path):
    if file_path.endswith('.xlsx'):
        df = pd.read_excel(file_path)
    elif file_path.endswith('.csv'):
        df = pd.read_csv(file_path)
    else:
        raise ValueError("Unsupported file type")
    
    # Generate a plot
    plt.figure(figsize=(10, 6))
    df.plot()
    plt.title('Data Plot')
    
    # Save the plot as SVG
    svg_file_path = file_path.replace(file_path.split('.')[-1], 'svg')
    plt.savefig(svg_file_path, format='svg')

    with open(svg_file_path, 'r') as file:
        svg_data = file.read()
    
    print(svg_data)
    plt.close()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python your_script.py <file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    process_file(file_path)
