<?php

header('Content-Type: application/json');

$date = $_GET['date'];

$classes = [];
$file = fopen('classes.csv', 'r');
while (($line = fgetcsv($file)) !== false) {
    if ($line[0] === $date) {
        $classes[] = $line;
    }
}
fclose($file);

echo json_encode($classes);
?>

