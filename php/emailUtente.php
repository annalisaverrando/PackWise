<?php
session_start();

if (isset($_SESSION['email'])) {
    echo json_encode(['email' => $_SESSION['email']]);
    exit;
}
echo json_encode(['email' => null]);
exit;