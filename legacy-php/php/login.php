<?php
session_start(); // Start or resume a session

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];

    $userFound = false;
    
    if (($handle = fopen("users.csv", "r")) !== FALSE) {
        while (($data = fgetcsv($handle)) !== FALSE) {
            if ($data[0] == $username && password_verify($password, $data[1])) {
                $userFound = true;
                $_SESSION['user_name'] = $username; // Store username in session
                $_SESSION['admin_level'] = $data[2]; // Store user admin level in session
                
                // Redirect based on admin level
                if ($_SESSION['admin_level'] == 1) {
                    // User is an admin
                    header("Location: finances.php");
                } else {
                    // User is not an admin
                    header("Location: index.html");
                }
                exit();
            }
        }
        fclose($handle);
    }

    if (!$userFound) {
        header("Location: login_failed.html"); // Redirect to login failed html
        exit; 
    }
} else {
    // Redirect to the login page
    header("Location: Login.html");
    exit;
}

?>