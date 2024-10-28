<?php
// Array of passwords to hash
$passwords = ['adminadmin2', 'grace247', 'coachcoach2'];

foreach ($passwords as $password) {
    $hashed = password_hash($password, PASSWORD_DEFAULT);
    echo $hashed . "\n";
}
?>
