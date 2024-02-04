  var dataFrames; // Declare dataFrames in the global scope
  var resultsDict = {};
  var defaultMzValue;
  var mzSelected = false; // Variable to track whether the mz value is selected
  var selectedMzValue = defaultMzValue;
  
  function updatePlots() {
      if (!mzSelected) {
          // Set mzSelected to true to indicate that the mz value has been selected
          mzSelected = true;

          selectedMzValue = parseFloat(document.getElementById('mz-selector').value);
          document.getElementById('mz-heading').innerText = `m/z = ${selectedMzValue.toFixed(4)}`;

          // Remove existing plots
          const plotsContainer = document.getElementById('plots-container');
          plotsContainer.innerHTML = '';
          // Fetch updated data or process existing data based on the selected mz value
          // You may need to modify this part based on your specific requirements
          // resultsDict = {};
          processResults(dataFrames);


      }
  }
  

// function showLoadingOnPlot(plotDivId) {
//     const plotContainer = document.getElementById(plotDivId);
//     if (plotContainer) {
//         plotContainer.innerHTML = '<div class="loading">Loading..</div>';
//     }
// }
// function hideLoadingOnPlot(plotDivId) {
//     const plotContainer = document.getElementById(plotDivId);
//     if (plotContainer) {
//         plotContainer.innerHTML = ''; // Remove loading div
//     }
// }

  function showLoading() {
      document.getElementById('loading').style.display = 'flex';
      document.getElementById('plots-container').style.display = 'none';
  }

  // Function to hide loading
  function hideLoading() {
      document.getElementById('loading').style.display = 'none';
      document.getElementById('plots-container').style.display = 'flex';
  }

  async function fetchMzValues() {
      try {
          const response = await fetch('mz_values.json');

          if (!response.ok) {
              throw new Error(`Failed to fetch mz values. Status: ${response.status}`);
          }

          const mzValuesData = await response.json();
          defaultMzValue = parseFloat(mzValuesData.mz_values[0]); // Set defaultMzValue to the 0th index value
          return mzValuesData.mz_values;
      } catch (error) {
          console.error(`Error fetching mz values: ${error.message}`);
          throw error;
      }
  }

  function updateMzDropdown(mzValues) {
      const mzSelector = document.getElementById('mz-selector');
      mzSelector.innerHTML = ''; // Clear the dropdown before updating

      mzValues.forEach((mzValue, index) => {
          const option = document.createElement('option');
          option.value = mzValue;
          option.text = `m/z = ${parseFloat(mzValue).toFixed(4)}`;
          mzSelector.appendChild(option);
      });

      // Set the default value to the first mz value in the list
      mzSelector.value = mzValues[0];
  }

  // Function to load and process CSV data
  async function fetchFileNames(folderPath) {
      showLoading();
      try {
          const response = await fetch(folderPath);

          if (!response.ok) {
              console.log(`error response: ${response.status}`);
              throw new Error(`Failed to fetch. Status: ${response.status}`);
          }

          let fileNames;

          try {
              // Try to parse the response as JSON
              const clonedResponse = response.clone(); // Clone the response object
              fileNames = await clonedResponse.json(); // Consume the cloned response as JSON
              console.log("File Names:", fileNames); // Print the file names
          } catch (jsonError) {
              // If parsing as JSON fails, assume it's HTML and extract file names differently
              const textResponse = await response.text(); // Read the response as text
              //<!-- console.log(`error response1: ${textResponse}`); -->
              // Check if the response is HTML (you can customize this check based on your server's response)
              if (textResponse.includes('<ul>')) {
                  // Extract file names from the HTML content
                  const parser = new DOMParser();
                  const htmlDoc = parser.parseFromString(textResponse, 'text/html');
                  const links = htmlDoc.querySelectorAll('a');

                  fileNames = Array.from(links).map(link => link.textContent.trim());
                  for (fileName of fileNames) {
                      if (fileName.endsWith('.csv')) {
                          fileName = fileName.replace('crc_hilic_', '').replace('_ttest.csv', '');
                          //const filePath = ${folderPath}${fileName};
                      }
                  }

              } else {
                  throw new Error('Unexpected response format');
              }
          }

          return fileNames;
      } catch (error) {
          console.error(`Error fetching file names: ${error.message}`);
          throw error; // Re-throw the error to propagate it
      } finally {
          // hideLoading(); // Hide loading after fetching data (whether successful or not)
      }
  }

  async function processData() {
      showLoading();
      try {
          const folderPath = '/normalvstumor_hilic_all/';
          const fileNames = await fetchFileNames(folderPath);
          const mzValues = await fetchMzValues();
          dataFrames = {}; // Initialize dataFrames in the global scope
          updateMzDropdown(mzValues);
          // Load CSV data into dataFrames
          await Promise.all(fileNames.map(async (fileName) => {
              if (fileName.endsWith('.csv')) {
                  const variableName = fileName.replace('crc_hilic_', '').replace('_ttest.csv', '');
                  const filePath = `${folderPath}${fileName}`;

                  try {
                      const response = await fetch(filePath);
                      const data = await response.text();
                      dataFrames[variableName] = await d3.csvParse(data); // Use await here
                  } catch (error) {
                      console.error(`Error reading file '${fileName}': ${error.message}`);
                  }
              }
          }));
          resultsDict = {};
          // Process dataFrames and generate plots
          processResults(dataFrames);
      } catch (error) {
          console.error(error.message);
      } finally {
          // Hide loading after processing data (whether successful or not)
          console.log('done');
      }
  }

  

  function createPlotDiv(variableName) {
      const plotDiv = document.createElement('div');
      plotDiv.id = `plot-${variableName}`;
      plotDiv.style.width = '300px'; // Adjust the width as needed
      plotDiv.style.height = '500px'; // Adjust the height as needed
      document.getElementById('plots-container').appendChild(plotDiv);
      // showLoadingOnPlot(plotDivId);

      return plotDiv.id;
  }

  // Function to process results and generate plots
  function processResults(dataFrames) {
      let plotDivId; // Declare plotDivId here
      // const plotsContainer = document.getElementById('plots-container');
      document.getElementById('mz-heading').innerText = `m/z = ${defaultMzValue.toFixed(4)}`;
      const mzHeadingElement = document.getElementById('mz-heading');
      if (!mzHeadingElement) {
          console.error("Element with id 'mz-heading' not found.");
          return;
      }
      mzHeadingElement.innerText = `m/z = ${defaultMzValue.toFixed(4)}`;

      for (const [variableName, df] of Object.entries(dataFrames)) {
          if (variableName.includes('output')) {
              const selectedRowOutput = df.filter(row => row.mz == defaultMzValue);
              if (selectedRowOutput.length > 0) {
                  const rawPval = selectedRowOutput[0].raw_pval;
                  const qFdr = selectedRowOutput[0].q_fdr;
                  const logFcMatched = parseFloat(selectedRowOutput[0].log_fc_matched);

                  let qFdrStars = '';
                  if (qFdr < 0.05 && qFdr > 0.01) {
                      qFdrStars = '*';
                  } else if (qFdr < 0.01 && qFdr > 0.001) {
                      qFdrStars = '**';
                  } else if (qFdr < 0.001) {
                      qFdrStars = '***';
                  }

                  // Display or use the results as needed
                  console.log(`Results for ${variableName}:`);
                  console.log(`Raw P-value: ${rawPval}`);
                  console.log(`Q FDR: ${qFdr}`);
                  console.log(`Log FC Matched: ${logFcMatched}`);
                  console.log(`Q FDR Stars: ${qFdrStars}`);

                  // Save the results in the dictionary
                  resultsDict[variableName] = {
                      "rawPval": rawPval,
                      "qFdr": qFdr,
                      "logFcMatched": logFcMatched,
                      "qFdrStars": qFdrStars
                  };
                  console.log('ResultDict for', variableName, resultsDict);
              } else {
                  console.log(`No data found for the selected 'mz' value in ${variableName}.`);
              }
          }
      }

      // Iterate through the DataFrames and plot diagrams
      for (const variableName in dataFrames) {
          // Check if the variable name does not contain 'output'
          if (!variableName.includes('output')) {
              console.log("DataFrames:", dataFrames);
              plotDivId = createPlotDiv(variableName); // Assign plotDivId here

              // Use the existing code to create the boxplot and swarmplot

              // Assuming you have access to the DOM element where you want to place the plot
              var plotContainer = document.getElementById(plotDivId);
              var categories = Object.keys(dataFrames);

              // Filter out categories that contain 'output'
              var validCategories = categories.filter(category => !category.includes('output'));

              var desiredRowIndex = dataFrames[variableName].findIndex(row => row.mz == defaultMzValue);
              console.log(desiredRowIndex, "th MZ: ", dataFrames[variableName][desiredRowIndex].mz);
              console.log(desiredRowIndex);

              if (desiredRowIndex !== -1) {
                  var rowData = dataFrames[variableName][desiredRowIndex];
                  var caseColumns = Object.keys(rowData).filter(key => key.includes('_Case')).map(key => rowData[key]);
                  var controlColumns = Object.keys(rowData).filter(key => key.includes('_Control')).map(key => rowData[key]);


                  var traceBox1 = {
                      x: Array(caseColumns.length).fill('Tumor'),
                      y: caseColumns,
                      type: 'box',
                      boxpoints: 'all',
                      marker: {
                          color: 'rgba(255, 0, 0, 0.5)', // Set the inner color to white
                          line: {
                              color: 'black', // Set the border color to black
                              width: 0.2 // Set the border width to make it bold
                          }
                      },
                      jitter: 0.3,
                      pointpos: 0,
                      showlegend: false,
                      name: "Tumor"
                  };

                  var traceBox2 = {
                      x: Array(controlColumns.length).fill('Normal'),
                      y: controlColumns,
                      type: 'box',
                      boxpoints: 'all',
                      marker: {
                          color: 'rgba(0, 255, 0, 0.5)', // Set the inner color to white
                          line: {
                              color: 'black', // Set the border color to black
                              width: 0.2 // Set the border width to make it bold
                          }
                      },
                      jitter: 0.3,
                      pointpos: 0,
                      showlegend: false,
                      name: "Normal"
                  };

                  var layout = {
                      width: 300, // Adjust the width to achieve a 3:5 ratio
                      height: 500, // Adjust the height to achieve a 3:5 ratio

                      xaxis: {
                          title: {
                              text: '<b>' + variableName + '</b>', // Use <b> HTML tag for bold
                              font: {
                                  size: 14,
                                  family: 'Arial, sans-serif',
                                  color: 'black'
                              }
                          },
                          tickangle: 90,
                          line: { // Add this part for Y-axis line
                              color: 'black',
                              width: 0.5
                          }
                      },
                      yaxis: {
                          title: 'Relative Abundance',
                          line: { // Add this part for Y-axis line
                              color: 'black',
                              width: 0.5
                          }
                      }
                  };

                  var data = [traceBox1, traceBox2];
                  var tempVariableName = variableName + '_ttest_output.csv';
                  console.log('Data:', data);
                  console.log('Result Dict:', resultsDict);
                  console.log('Current Variable Name:', tempVariableName);
                  if (resultsDict[tempVariableName]) {
                      console.log('qFdrStars:', resultsDict[tempVariableName].qFdrStars);
                      console.log('logFcMatched:', resultsDict[tempVariableName].logFcMatched.toFixed(2));
                      console.log('q:' + resultsDict[tempVariableName].qFdrStars + '\nLogFC:' + resultsDict[tempVariableName].logFcMatched.toFixed(2));

                      // Add q_fdr_stars and log_fc_matched information
                      var annotations = [
                          {
                              x: 1.51,
                              y: 0.94,
                              text: 'q:' + resultsDict[tempVariableName].qFdrStars + '\nLogFC:' + resultsDict[tempVariableName].logFcMatched.toFixed(2),
                              xref: 'paper',
                              yref: 'paper',
                              showarrow: false,
                              font: {
                                  size: 12,
                                  color: 'black'
                              }
                          }
                      ];

                      layout.annotations = annotations;
                  } else {
                      console.log('Results not found for', tempVariableName);
                  }
                  Plotly.newPlot(plotContainer, data, layout);
                  console.log("Plot done for DataFrame '" + variableName + "'");

              } else {
                  console.log("No unique row found for the selected 'mz' value in DataFrame '" + variableName + "'.");
              }
              //  hideLoadingOnPlot(plotDivId);
          }

      }
      hideLoading();
  }

  // Load and process data on page load
  processData();


