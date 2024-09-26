# import sys
# import pandas as pd
# import matplotlib.pyplot as plt

# def process_file(file_path, y_axis_key, plot_type, graph_type):
#     if file_path.endswith('.xlsx'):
#         df = pd.read_excel(file_path)
#     elif file_path.endswith('.csv'):
#         df = pd.read_csv(file_path)
#     else:
#         raise ValueError("Unsupported file type")

#     # Ensure y_axis_key exists in the dataframe
#     if y_axis_key not in df.columns:
#         raise ValueError(f"Y-axis key '{y_axis_key}' not found in the data columns.")

#     svg_file_paths = []

#     def plot_graph(x, y, title, svg_file_path):
#         plt.figure(figsize=(10, 6))
#         if graph_type == "line":
#             plt.plot(x, y)
#         elif graph_type == "scatter":
#             plt.scatter(x, y)
#         elif graph_type == "bar":
#             plt.bar(x, y)
#         plt.title(title)
#         plt.savefig(svg_file_path, format='svg')
#         svg_file_paths.append(svg_file_path)
#         plt.close()

#     # Generate the plot(s)
#     if plot_type == "single":
#         plt.figure(figsize=(10, 6))
#         for column in df.columns:
#             if column != y_axis_key:
#                 if graph_type == "line":
#                     plt.plot(df[column], df[y_axis_key], label=column)
#                 elif graph_type == "scatter":
#                     plt.scatter(df[column], df[y_axis_key], label=column)
#                 elif graph_type == "bar":
#                     plt.bar(df[column], df[y_axis_key], label=column)
#         plt.title(f'{graph_type.capitalize()}  {y_axis_key}')
#         plt.legend()
#         svg_file_path = file_path.replace(file_path.split('.')[-1], f'{graph_type}.svg')
#         plt.savefig(svg_file_path, format='svg')
#         svg_file_paths.append(svg_file_path)
#         plt.close()
#     elif plot_type == "multiple":
#         for column in df.columns:
#             if column != y_axis_key:
#                 svg_file_path = f'{file_path}_{column}.svg'
#                 plot_graph(df[column], df[y_axis_key], f'{graph_type.capitalize()} Plot for Y-Axis: {y_axis_key} vs {column}', svg_file_path)
#     else:
#         raise ValueError("Invalid plot type. Must be 'single' or 'multiple'.")

#     return svg_file_paths

# if __name__ == "__main__":
#     if len(sys.argv) != 5:
#         print("Usage: python your_script.py <file_path> <y_axis_key> <plot_type> <graph_type>")
        
    
#     file_path = sys.argv[1]
#     y_axis_key = sys.argv[2]
#     plot_type = sys.argv[3]
#     graph_type = sys.argv[4]
    
#     try:
#         svg_file_paths = process_file(file_path, y_axis_key, plot_type, graph_type)
#         for svg_file_path in svg_file_paths:
#             print(svg_file_path)  # Print the file path for the Node.js server to read
#     except Exception as e:
#         print(f"Error: {str(e)}")
import sys
import pandas as pd
import matplotlib.pyplot as plt
import plotly.express as px
import json
import plotly

def process_file(file_path, y_axis_key, plot_type, graph_type, interactive=True):
    # Load the appropriate data file
    if file_path.endswith('.xlsx'):
        df = pd.read_excel(file_path)
    elif file_path.endswith('.csv'):
        df = pd.read_csv(file_path)
    else:
        raise ValueError("Unsupported file type. Please provide an .xlsx or .csv file.")

    # Ensure y_axis_key exists in the dataframe
    if y_axis_key not in df.columns:
        raise ValueError(f"Y-axis key '{y_axis_key}' not found in the data columns.")

    plots = []  # To hold plot data for response

    def plot_graph(x, y, title):
        """Plot graphs using Matplotlib and save as SVG."""
        plt.figure(figsize=(10, 6))
        if graph_type == "line":
            plt.plot(x, y)
        elif graph_type == "scatter":
            plt.scatter(x, y)
        elif graph_type == "bar":
            plt.bar(x, y)
        plt.title(title)
        svg_file_path = f"{title.replace(' ', '_').replace(':', '')}.svg"
        plt.savefig(svg_file_path, format='svg')
        plt.close()
        return svg_file_path  # Return the SVG path for reference

    def plot_interactive_graph(x, y, title):
        """Create interactive plots using Plotly and return as JSON."""
        if graph_type == "line":
            fig = px.line(df, x=x, y=y, title=title)
        elif graph_type == "scatter":
            fig = px.scatter(df, x=x, y=y, title=title)
        elif graph_type == "bar":
            fig = px.bar(df, x=x, y=y, title=title)
        
        # Log the figure for debugging
        print(f"Generated Plotly figure for {title}: {fig.to_json()}")  # Log the generated figure
        json_fig = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
        print(f"Generated Plotly figure for {title}: {json_fig}")  # Log the JSON
        return json_fig


    # Generate the plot(s)
    if plot_type == "single":
        for column in df.columns:
            if column != y_axis_key:
                title = f'{graph_type.capitalize()} {y_axis_key} vs {column}'
                if interactive:
                    plots.append({
                        "title": title,
                        "data": plot_interactive_graph(column, y_axis_key, title)
                    })
                    
                else:
                    svg_path = plot_graph(df[column], df[y_axis_key], title)
                    plots.append({"title": title, "svg_path": svg_path})
                break  # Only create one plot for 'single' type

    elif plot_type == "multiple":
        for column in df.columns:
            if column != y_axis_key:
                title = f'{graph_type.capitalize()} Plot for Y-Axis: {y_axis_key} vs {column}'
                if interactive:
                    plots.append({
                        "title": title,
                        "data": plot_interactive_graph(column, y_axis_key, title)
                    })
                else:
                    svg_path = plot_graph(df[column], df[y_axis_key], title)
                    plots.append({"title": title, "svg_path": svg_path})

    else:
        raise ValueError("Invalid plot type. Must be 'single' or 'multiple'.")

    return plots  # Return a list of plot data

if __name__ == "__main__":
    if len(sys.argv) != 6:
        print(json.dumps({
            "success": False,
            "message": "Invalid number of arguments.",
            "expected": "Usage: python your_script.py <file_path> <y_axis_key> <plot_type> <graph_type> <interactive>"
        }))
        sys.exit(1)

    file_path = sys.argv[1]
    y_axis_key = sys.argv[2]
    plot_type = sys.argv[3]
    graph_type = sys.argv[4]
    interactive = sys.argv[5].lower() == "true"  # Convert 'true'/'false' string to boolean

    try:
        result = process_file(file_path, y_axis_key, plot_type, graph_type, interactive)
        print(json.dumps({"success": True, "data": result}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}), file=sys.stderr)
