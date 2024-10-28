<?php

// Assuming JSON input, decode it
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, TRUE); //convert JSON into array

if (!is_null($input)) {
    // Extract variables
    $name = $input['name'];
    $type = $input['type'];
    $confirmation = $input['confirmation'];
    $amount = $input['amount'];

    // Construct the line to append
    $line = "$name,$type,$confirmation,$amount\n";

    // File path to the expenses.csv file
    $filePath = 'expenses.csv';

    // Append the line to the file
    file_put_contents($filePath, $line, FILE_APPEND);

    echo "Expense added successfully";
} else {
    // Handle error; invalid input
    http_response_code(400);
    echo "Invalid input";
}

?>
