import numpy as np
import matplotlib.pyplot as plt
import mpld3
from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def index():
    # Your data
    columns = ['Cecum', 'Ascending', 'Transverse',
               'Descending', 'Sigmoid', 'Rectosigmoid', 'Rectum']
    data = {
        '5-Hydroxyindoleacetic acid': {'P': [0.0003, 0.001, 0.105, 8.00E-06, 1.00E-09, 2.00E-08, 3E-13],
                                       'FC': [-1.77, -2.37, -2.21, -2.668, -2.22, -2.71, -2.36],
                                       'Odds ratio': [0.425, 0.246, 0.273, 0.126, 0.272, 0.118, 0.149]},
        'Uric acid': {'P': [6.00E-03, 6.00E-03, 4.20E-02, 4.20E-02, 3.00E-08, 5.40E-04, 8.00E-12],
                      'FC': [-0.63, -0.9, -1.24, -0.93, -1.09, -0.89, -1.34],
                      'Odds ratio': [0.486, 0.38, 0.227, 0.517, 0.27, 0.262, 0.179]}
    }

    # Plotting
    width = 0.2
    x = np.arange(len(columns))

    fig, ax = plt.subplots()

    colors = {'P': 'green', 'FC': 'yellow', 'Odds ratio': 'red'}

    for i, (compound, values) in enumerate(data.items()):
        for j, (label, y_values) in enumerate(values.items()):
            ax.bar(x + j * (width/3) + i * (width + 0.2), y_values,
                   width=width/3, label=f'{compound} - {label}', color=colors[label])

    ax.set_xticks(x + (len(data) - 1) * width / 2)
    ax.set_xticklabels(columns)
    ax.legend()

    plt.xlabel('Intestinal Regions')
    plt.ylabel('Values')
    plt.title('Bar Graph of the Data')

    # Convert the Matplotlib plot to HTML using mpld3
    html_code = mpld3.fig_to_html(fig)

    # Close the plot to avoid blocking
    plt.close()

    return render_template('index.html', plot_html=html_code)


if __name__ == '__main__':
    app.run(debug=True)
