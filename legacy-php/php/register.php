<?php
// Check if the form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $username = $_POST['username'];
    $password = $_POST['password'];
    $email = $_POST['email'];
    $security_answer = $_POST['security_answer'];

    // Hash the password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Open the CSV file for appending
    $file = fopen('users.csv', 'a');

    // Write the data to the CSV file
    fputcsv($file, array($username, $hashed_password, $email, $security_answer));

    // Close the file
    fclose($file);

    // Redirect to a success page (or display a success message)
    echo "Registration successful!";
} else {
    echo "Invalid request method.";
}
?>
