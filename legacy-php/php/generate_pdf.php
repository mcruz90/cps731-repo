<?php
require_once('vendor/tecnickcom/tcpdf/tcpdf.php');

$pdf = new TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

$pdf->SetCreator(PDF_CREATOR);
$pdf->SetAuthor('Your Name');
$pdf->SetTitle('Expenses Report');
$pdf->SetSubject('TCPDF Tutorial');
$pdf->SetKeywords('TCPDF, PDF, example, test, guide');

$pdf->setHeaderFont(Array(PDF_FONT_NAME_MAIN, '', PDF_FONT_SIZE_MAIN));
$pdf->setFooterFont(Array(PDF_FONT_NAME_DATA, '', PDF_FONT_SIZE_DATA));

$pdf->SetDefaultMonospacedFont(PDF_FONT_MONOSPACED);

$pdf->SetAutoPageBreak(TRUE, PDF_MARGIN_BOTTOM);

$pdf->setImageScale(PDF_IMAGE_SCALE_RATIO);

$pdf->setFontSubsetting(true);

$pdf->SetFont('dejavusans', '', 14, '', true);

$pdf->AddPage();

if (($handle = fopen("expenses.csv", "r")) !== FALSE) {
    if (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        $num = count($data);
        $cellWidth = ($pdf->getPageWidth() - PDF_MARGIN_LEFT - PDF_MARGIN_RIGHT) / $num;
        for ($c=0; $c < $num; $c++) {
            $pdf->Cell($cellWidth, 10, $data[$c], 1, 0, 'C', 0, '', 0, false, 'T', 'M');
        }
        $pdf->Ln();
    }
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        $num = count($data);
        for ($c=0; $c < $num; $c++) {
            $pdf->Cell($cellWidth, 10, $data[$c], 1, 0, 'C', 0, '', 0, false, 'T', 'M');
        }
        $pdf->Ln();
    }
    fclose($handle);
}

$pdf->Output('expenses.pdf', 'I');
?>