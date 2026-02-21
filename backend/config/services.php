<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'routing' => [
        'provider' => env('ROUTING_PROVIDER', 'google'), // google | osrm
        'fallback_provider' => env('ROUTING_FALLBACK_PROVIDER', 'osrm'), // osrm | google
        'osrm_base_url' => env('OSRM_BASE_URL', 'https://router.project-osrm.org'),
        'osrm_profile' => env('OSRM_PROFILE', 'driving'),
        'google_maps_api_key' => env('GOOGLE_MAPS_API_KEY'),
    ],

];
