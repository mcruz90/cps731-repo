<?php
    session_start();
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $username = $_POST["username"];
        $password = $_POST["new_password"];
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        if (!file_exists("users.csv")) {
            echo "Error: users.csv does not exist.";
        } else {
            $data = array_map('str_getcsv', file('users.csv'));
            foreach ($data as $key => $row) {
                if ($row[0] == $username) {
                    $data[$key][1] = $hashed_password;
                    break;
                }
            }

            $file = fopen("users.csv", "w");
            foreach ($data as $row) {
                fputcsv($file, $row);
            }
            fclose($file);

            echo "Password reset successful. <a href='login.html'>Login</a>";
        }
    }
?>