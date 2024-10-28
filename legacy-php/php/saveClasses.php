<?php

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$className = $data['className'];
$category = $data['category'];
$time = $data['time'];
$location = $data['location'];
$spots = $data['spots'];
$day = $data['day'];

$classData = array($day, $time, $className, $category, $location, $spots);

$file = fopen('classes.csv', 'a');
fputcsv($file, $classData);
fclose($file);

$response = [
    'success' => true,
    'message' => 'Class saved successfully',
];

echo json_encode($response);
?>
