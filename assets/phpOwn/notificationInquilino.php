<?php
#User CloudFirestore
$dataExternal = explode('fecha:', $payment->external_reference);

$lapsoFecha = $dataExternal[1];
$keyRentador = explode('|', $dataExternal[0])[1];
$keyInquilino = explode('|', $dataExternal[0])[0];
$keyProduct = explode('|', $dataExternal[0])[2];

#Url database
$url = "https://firestore.googleapis.com/v1beta1/projects/myspace-632e9/databases/(default)/documents/clientes/" . $keyInquilino;

#Listado de usuario - CURL
$cht = curl_init();
curl_setopt($cht, CURLOPT_URL, $url);
curl_setopt($cht, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($cht);
curl_close($cht);

#Decodificacion del JSON
$info = json_decode($response, true);

if (isset($info['fields']['reservas']['arrayValue']) == 1) {
    array_push($info['fields']['reservas']['arrayValue']['values'], ['stringValue' => $keyReserva]);
} else {
    $info['fields']['reservas']['arrayValue'] = ['values' => [['stringValue' => $keyReserva]]];
}

#Update Profile
$curl = curl_init();

curl_setopt_array($curl, array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => 'POST',
    CURLOPT_HTTPHEADER => array('Content-Type: application/json',
        'Content-Length: ' . strlen(json_encode($info)),
        'X-HTTP-Method-Override: PATCH'),
    CURLOPT_URL => $url,
    CURLOPT_USERAGENT => 'cURL',
    CURLOPT_POSTFIELDS => json_encode($info),
));

$response = curl_exec($curl);
//  print_r($response);
curl_close($curl);
