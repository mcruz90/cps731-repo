<?php

session_start();

// Redirect to login if not logged in or not an admin
if (!isset($_SESSION['user_name'])) {
    header("Location: Login.html");
    exit;
}

if ($_SESSION['admin_level'] != 1) {
    header("Location: access_denied.html");
    exit;
}

$error = '';
$error_expense = '';
$name = '';
$balance = '';
$category = '';
$payed = '';
$email = '';
$subject = '';
$message = '';

function clean_text($string)
{
    $string = trim($string);
    $string = stripslashes($string);
    $string = htmlspecialchars($string);
    return $string;
}

if (file_exists('contact.csv') && filesize('contact.csv') > 0) {
    $csv_data = array_map('str_getcsv', file('contact.csv'));
} else {
    $csv_data = [];
}

if(isset($_POST["submit"]))
{
    if(empty($_POST["name"]) || empty($_POST["email"]) || empty($_POST["subject"]) || empty($_POST["message"]))
    {
        $error .= '<p><label class="text-danger">All fields are required</label></p>';
    }
    else
    {
        $name = clean_text($_POST["name"]);
        $email = clean_text($_POST["email"]);
        $subject = clean_text($_POST["subject"]);
        $message = clean_text($_POST["message"]);

        $file_open = fopen("contact.csv", "a");
        $form_data = array($name, $email, $subject, $message);
        fputcsv($file_open, $form_data);
        fclose($file_open);

        // Reload CSV data
        $csv_data = array_map('str_getcsv', file('contact.csv'));

        $name = '';
        $email = '';
        $subject = '';
        $message = '';
        $error = '<label class="text-success">User Added Successfully!</label>';
    }
}
if(isset($_POST["delete-submit"]))
{
    if(isset($_POST['delete']) && !empty($_POST['delete'])) {
        $delete_rows = $_POST['delete'];
        $new_csv_data = [];

        foreach($csv_data as $key => $row) {
            if (!in_array($key, $delete_rows)) {
                $new_csv_data[] = $row;
            }
        }

        $file = fopen('contact.csv', 'w');
        foreach($new_csv_data as $fields) {
            fputcsv($file, $fields);
        }
        fclose($file);

        // Reload CSV data
        $csv_data = array_map('str_getcsv', file('contact.csv'));

        header("Location: {$_SERVER['REQUEST_URI']}");
        exit;
    } else {
        $error = '<label class="text-danger">Please select at least one row to delete</label>';
    }
}

if (file_exists('expenses.csv') && filesize('expenses.csv') > 0) {
    $expenses_data = array_map('str_getcsv', file('expenses.csv'));
} else {
    $expenses_data = [];
}

if (isset($_POST["submit-expense"])) {
    if (empty($_POST["name"]) || empty($_POST["category"]) || empty($_POST["payed"]) || empty($_POST["balance"])) {
        $error_expense .= '<p><label class="text-danger">All fields are required to add</label></p>';
    } else {
        $name = clean_text($_POST["name"]);
        $category = clean_text($_POST["category"]);
        $payed = clean_text($_POST["payed"]);
        $balance = clean_text($_POST["balance"]);

        $expenses_csv = fopen("expenses.csv", "a");
        $expense_data = array($name, $category, $payed, $balance);
        fputcsv($expenses_csv, $expense_data);
        fclose($expenses_csv);

        // Reload CSV data
        $expenses_data = array_map('str_getcsv', file('expenses.csv'));

        $name = '';
        $category = '';
        $payed = '';
        $balance = '';
        $error_expense = '<label class="text-success">Expense Added Successfully!</label>';
    }
}

if (isset($_POST["delete-expense-submit"])) {
    if (isset($_POST['delete']) && !empty($_POST['delete'])) {
        $delete_rows = $_POST['delete'];
        $new_expenses_data = [];

        foreach($expenses_data as $key => $row) {
            if (!in_array($key, $delete_rows)) {
                $new_expenses_data[] = $row;
            }
        }

        $file = fopen('expenses.csv', 'w');
        foreach($new_expenses_data as $fields) {
            fputcsv($file, $fields);
        }
        fclose($file);

        // Reload CSV data
        $expenses_data = array_map('str_getcsv', file('expenses.csv'));

        header("Location: {$_SERVER['REQUEST_URI']}");
        exit;
    } else {
        $error_expense = '<label class="text-danger">Please select at least one row to delete</label>';
    }
}

if (($handle = fopen("expenses.csv", "r")) !== FALSE) {
    // Skip the header row
    fgetcsv($handle);

    $paidTotal = 0;
    $notPaidTotal = 0;

    // Loop through each row in the CSV
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        // If the 'hasPaid' column is 'Y', add the 'Amount' to the 'Paid' total
        if ($data[2] == 'Y') {
            $paidTotal += $data[3];
        }
        // If the 'hasPaid' column is 'N', add the 'Amount' to the 'Not Paid' total
        else if ($data[2] == 'N') {
            $notPaidTotal += $data[3];
        }
    }

    // Close the CSV file
    fclose($handle);

    // Prepare the $pie_chart_data array
    $pie_chart_data = [
        ['Paid (Y)', $paidTotal],
        ['Not Paid (N)', $notPaidTotal]
    ];
}
?>

<!DOCTYPE html>
<html>
<head>
    <script src="https://kit.fontawesome.com/bbdcfd916b.js" crossorigin="anonymous"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Kumbh+Sans:wght@700&display=swap" rel="stylesheet">
    <title>Serenity Yoga Website Finances</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js"></script>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" />
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/c3/0.7.20/c3.min.css" rel="stylesheet" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/5.16.0/d3.min.js" charset="utf-8"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/c3/0.7.20/c3.min.js"></script>
    <script>
        function showForm() {
            document.getElementById('add-button').style.display = 'none';
            document.getElementById('form-container').style.display = 'block';
        }

        function showExpenseForm() {
            document.getElementById('add-expense-button').style.display = 'none';
            document.getElementById('form-expense-container').style.display = 'block';
        }

        function toggleCheckbox(element) {
            var checkboxes = document.getElementsByName('delete[]');
            for (var i = 0; i < checkboxes.length; i++) {
                checkboxes[i].checked = element.checked;
            }
        }

        function validateDelete() {
            var checkboxes = document.getElementsByName('delete[]');
            var isChecked = false;
            for (var i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].checked) {
                    isChecked = true;
                    break;
                }
            }
            if (!isChecked) {
                alert('Please select at least one row to delete');
                return false;
            }
            return true;
        }
    </script>
</head>
<body>
    <div style="position: absolute; top: 10px; right: 10px;">
        <form action="logout.php" method="post">
            <button type="submit" class="btn btn-danger">Log Out</button>
        </form>
    </div>
<br />
<style>
    .container h3, h2 {
        background: linear-gradient(to top, #5593DC 0%, #00326a 100%);
        -webkit-background-clip: text;
        color: transparent;
        font-weight: bold;
    }

    .col-md-6 th, td {
        color: #fff;
    }

    body {
        background-color: #141414;
    }

    body, button, input, textarea {
        font-family: 'Roboto', sans-serif;
    }

    .table-container {
        margin-bottom: 20px;
    }

    #pdfGenerator {
    font-family: 'Helvetica', 'Arial', sans-serif;
    font-size: 14px;
    color: #000;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: inline-block;
    margin: 4px 2px;
    transition-duration: 0.4s;
    background-color: turquoise;
}

#pdfGenerator:hover {
    background-color: #008CBA;
    color: white;
}
</style>
<div class="container">
    <h2 align="center">Cool Yoga App Database</h2>
    <br />
    <div class="row">
        <div class="col-md-12 table-container">
            <h3 align="center">CSV Data</h3>
            <form method="post" onsubmit="return validateDelete()">
                <table class="table table-bordered">
                    <thead>
                    <tr style="font-weight: bold; color: white;">
                        <th><input type="checkbox" onclick="toggleCheckbox(this)"></th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Password</th>
                        <th>Secret Question Answer</th>
                    </tr>
                    </thead>
                    <tbody>
                    <?php foreach($csv_data as $key => $row): ?>
                        <tr>
                            <td><input type="checkbox" name="delete[]" value="<?php echo $key; ?>"></td>
                            <td><?php echo $row[0]; ?></td>
                            <td><?php echo $row[1]; ?></td>
                            <td><?php echo $row[2]; ?></td>
                            <td><?php echo $row[3]; ?></td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
                <div align="center">
                    <button type="submit" name="delete-submit" class="btn btn-danger">Delete</button>
                </div>
                <?php echo $error; ?>
            </form>
        </div>
    </div>
    <div class="row">
        <div id="add-button" class="col-md-12" align="center">
            <button class="btn btn-info" onclick="showForm()">Add</button>
        </div>
    </div>
    <div class="row">
        <div class="col-md-12 table-container">
            <h3 align="center">Expenses</h3>
            <form method="post" onsubmit="return validateDelete()">
                <table class="table table-bordered">
                    <thead>
                    <tr style="font-weight: bold; color: white;">
                        <th><input type="checkbox" onclick="toggleCheckbox(this)"></th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Payed/Not Payed</th>
                        <th>Amount ($)</th>
                    </tr>
                    </thead>
                    <tbody>
                    <?php foreach($expenses_data as $key => $row): ?>
                        <tr>
                            <td><input type="checkbox" name="delete[]" value="<?php echo $key; ?>"></td>
                            <td><?php echo $row[0]; ?></td>
                            <td><?php echo $row[1]; ?></td>
                            <td><?php echo $row[2]; ?></td>
                            <td><?php echo $row[3]; ?></td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
                <div align="center">
                    <button type="submit" name="delete-expense-submit" class="btn btn-danger">Delete Expense</button>
                </div>
                <?php echo $error_expense; ?>
            </form>
        </div>
    </div>
    <div class="row">
        <div id="add-expense-button" class="col-md-12" align="center">
            <button class="btn btn-info" onclick="showExpenseForm()">Add Expense</button>
        </div>
    </div>
    <div class="row">
        <div id="form-container" class="col-md-12" style="display: none;">
            <form method="post">
                <h3 align="center">Submission Form</h3>
                <br />
                <?php echo $error; ?>
                <div class="form-group">
                    <label>Enter Name</label>
                    <input type="text" name="name" placeholder="Enter Name" class="form-control" value="<?php echo $name; ?>" />
                </div>
                <div class="form-group">
                    <label>Enter Email</label>
                    <input type="text" name="email" class="form-control" placeholder="Enter Email" value="<?php echo $email; ?>" />
                </div>
                <div class="form-group">
                    <label>Enter Password</label>
                    <input type="text" name="subject" class="form-control" placeholder="Enter Password" value="<?php echo $subject; ?>" />
                </div>
                <div class="form-group">
                    <label>Enter Outstanding Balance</label>
                    <textarea name="message" class="form-control" placeholder="Enter Outstanding Balance"><?php echo $message; ?></textarea>
                </div>
                <div class="form-group" align="center">
                    <input type="submit" name="submit" class="btn btn-info" value="Submit" />
                </div>
            </form>
        </div>
    </div>
    <div class="row">
        <div id="form-expense-container" class="col-md-12" style="display: none;">
            <form method="post">
                <h3 align="center">Expense</h3>
                <br />
                <?php echo $error_expense; ?>
                <div class="form-group">
                    <label>Enter Name</label>
                    <input type="text" name="name" placeholder="Enter Name" class="form-control" value="<?php echo $name; ?>" />
                </div>
                <div class="form-group">
                    <label>Enter Category of Expense</label>
                    <input type="text" name="category" class="form-control" placeholder="Enter Category" value="<?php echo $category; ?>" />
                </div>
                <div class="form-group">
                    <label>Did you pay?</label>
                    <input type="text" name="payed" class="form-control" placeholder="Enter Y or N" value="<?php echo $payed; ?>" />
                </div>
                <div class="form-group">
                    <label>Enter amount you paid</label>
                    <textarea name="balance" class="form-control" placeholder="Enter Amount"><?php echo $balance; ?></textarea>
                </div>
                <div class="form-group" align="center">
                    <input type="submit" name="submit-expense" class="btn btn-info" value="Submit" />
                </div>
            </form>
        </div>
    </div>
    <button id="pdfGenerator">Generate PDF</button>
    <div class="row">
        <div class="col-md-12" style="margin-top: 50px;">
            <h3 align="center">Expense Proportion</h3>
            <div id="pie-chart"></div>
        </div>
    </div>
</div>

<script>
window.onload = function() {
    var pieChartData = <?php echo json_encode($pie_chart_data); ?>;

    var pie = c3.generate({
        bindto: '#pie-chart',
        data: {
            columns: pieChartData,
            type: 'pie',
            names: {
                'Paid (Y)': 'Yes',
                'Not Paid (N)': 'No'
            }
        },
        tooltip: {
            format: {
                title: function (d) { 
                    var id = pie.data()[0].ids[d];
                    return id === 'Paid (Y)' ? 'Yes' : 'No'; 
                },
                value: function (value, ratio, id) {
                    var format = d3.format(',');
                    return format(value);
                }
            }
        },
        onrendered: function () {
            d3.selectAll("#pie-chart text").style("fill", "#fff").style("font-weight", "bold");
        }
    });
    document.getElementById('pdfGenerator').addEventListener('click', function() {
    window.open('generate_pdf.php');
});
}
</script>
</body>
</html>
