<?php
session_start();

// Check if logged in
if (!isset($_SESSION['user_name'])) {
    // Not logged in, redirect to login page
    header("Location: Login.html");
    exit;
}

// Check if the user is an admin
if ($_SESSION['admin_level'] == 1) {
    // Is an admin, redirect to finances.php
    header("Location: finances.php");
    exit;
} else {
    // Not an admin, redirect to index.html or show an error
    header("Location: index.html"); // or any other appropriate action
    exit;
}
?>
