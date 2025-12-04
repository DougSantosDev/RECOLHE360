<?php

return [

    // Rotas que terão CORS aplicado (APIs e cookie CSRF se necessário)
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // Métodos HTTP permitidos. Pode ser lista separada por vírgula no .env
    'allowed_methods' => array_map('trim', explode(',', env('CORS_ALLOWED_METHODS', 'GET,POST,PUT,PATCH,DELETE,OPTIONS'))),

    // Origens permitidas. Em desenvolvimento pode usar '*'.
    // Em produção, defina domínios específicos: https://app.seu-dominio.com
    'allowed_origins' => array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', '*')))),

    'allowed_origins_patterns' => [],

    // Cabeçalhos permitidos nas requisições
    'allowed_headers' => array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_HEADERS', 'Authorization,Content-Type,Accept,Origin,User-Agent,Referer')))),

    // Cabeçalhos expostos ao cliente (normalmente não é necessário para Bearer)
    'exposed_headers' => array_filter(array_map('trim', explode(',', env('CORS_EXPOSED_HEADERS', '')))),

    // Cache do preflight em segundos
    'max_age' => (int) env('CORS_MAX_AGE', 3600),

    // Para Bearer tokens (Sanctum personal access token) mantenha false.
    // Se usar cookies de sessão/Sanctum SPA, troque para true e NÃO use '*'.
    'supports_credentials' => filter_var(env('CORS_SUPPORTS_CREDENTIALS', false), FILTER_VALIDATE_BOOL),
];

