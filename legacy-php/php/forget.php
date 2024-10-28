<?php
    session_start();

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $username = $_POST["username"];
        $security_answer = $_POST["security_answer"];

        if (!file_exists("users.csv")) {
            echo "Error: users.csv does not exist.";
        } else {
            $file = fopen("users.csv", "r");
            $userExists = false;
            while (($row = fgetcsv($file)) !== FALSE) {
                if ($row[0] == $username) {
                    $userExists = true;
                    if ($row[4] == $security_answer) {
                        $_SESSION["username"] = $username;
                        header("Location: reset_password.html");
                        exit();
                    } else {
                        echo "<h1>Password Reset failed</h1>";
                        echo "Incorrect username or security answer. Please try again.<br>";
                        echo "<a href='forget.html'>Try again</a>";
                    }
                    break;
                }
            }
            fclose($file);

            if (!$userExists) {
                echo "<h1>Password Reset failed</h1>";
                echo "Incorrect username or security answer. Please try again.<br>";
                echo "<a href='forget.html'>Try again</a>";
            }
        }
    }
?>