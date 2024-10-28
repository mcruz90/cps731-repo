<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    $className = $data['className'];
    $day = $data['day'];
    $newSpots = $data['newSpots'];

    $rows = array();
    $file = fopen('classes.csv', 'r');
    while (($row = fgetcsv($file)) !== FALSE) {
        // Assuming class name is the first column [0] and day is the second column [1]
        if (trim($row[0]) === trim($className) && trim($row[1]) === trim($day)) {
            $row[5] = $newSpots; // Spots are in the sixth column
        }
        $rows[] = $row;
    }
    fclose($file);

    // Write the updated data back to the file
    $file = fopen('classes.csv', 'w');
    foreach ($rows as $row) {
        fputcsv($file, $row);
    }
    fclose($file);

    echo "Spots updated successfully for $className on $day.";
} else {
    http_response_code(400);
    echo "Invalid request method.";
}

?>
