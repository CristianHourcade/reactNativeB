<?php

$type = $_GET["type"];
$token = $_GET["token"];

$urlNotification = "https://exp.host/--/api/v2/push/send";
$data = array(
    'to' => $token,
    'sound' => 'default',
    'body' => ($type == 'message') ? 'Tenes un mensaje nuevo' : 'Algo paso :D',
);

$payload = json_encode($data);

// Prepare new cURL resource
$ch = curl_init($urlNotification);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLINFO_HEADER_OUT, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
// Set HTTP Header for POST request
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'Content-Length: ' . strlen($payload))
);

// Submit the POST request
$result = curl_exec($ch);
print_r($result);
// Close cURL session handle
curl_close($ch);
?>