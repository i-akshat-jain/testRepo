<?php
// Specify the path to the folder
$folderPath = $_GET['folderPath'] ?? '';

// Check if the folder path is provided
if ($folderPath !== '') {
    // Combine the folder path and the server's document root
    $absolutePath = $_SERVER['DOCUMENT_ROOT'] . $folderPath;

    // Check if the folder exists
    if (is_dir($absolutePath)) {
        // Get all CSV files in the folder
        $csvFiles = glob($absolutePath . '/*.csv');

        // Extract only the file names without the path
        $fileNames = array_map('basename', $csvFiles);

        // Return the file names in JSON format
        header('Content-Type: application/json');
        echo json_encode($fileNames);
    } else {
        // Return an error message if the folder doesn't exist
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(array('error' => 'Folder not found'));
    }
} else {
    // Return an error message if the folder path is not provided
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(array('error' => 'Folder path not provided'));
}
?>
