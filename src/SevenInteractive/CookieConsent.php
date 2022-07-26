<?php

namespace SevenInteractive\CookieConsent;

class CookieConsent
{
    CONST URL = 'https://crm-7rs.cz/api/cookie/save-consent';

    /**
     * @var string
     */
    private $ip;

    /**
     * @var string
     */
    private $sessionId;

    /**
     * @var string
     */
    private $token;

    /**
     * @var string
     */
    private $data;

    /**
     * CookieConsent public constructor.
     */
    public function __construct(string $token = null)
    {
        $this->ip = $_SERVER['REMOTE_ADDR'];
        $this->sessionId = session_id();
        $this->token = $token;
    }

    /**
     * @return string
     */
    public function getToken()
    {
        return $this->token;
    }

    /**
     * @param string $token
     */
    public function setToken($token)
    {
        $this->token = $token;
    }

    /**
     * @return string
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * @param string $data
     */
    public function setData($data)
    {
        $this->data = $data;
    }

    public function send()
    {
        $headers = ["Content-Type: application/x-www-form-urlencoded"];
        $data = "sessionId=".$this->sessionId."&token=".$this->getToken()."&ip=".$this->ip."&data=".$this->getData();

        $curl = curl_init(self::URL);
        curl_setopt($curl, CURLOPT_POST, true);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        curl_exec($curl);
        curl_close($curl);
    }
}