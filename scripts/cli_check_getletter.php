<?php
require_once __DIR__ . '/../api/config/db.php';

try {
    $p = $argv[1] ?? null;
    if ($p === null) {
        echo "Usage: php cli_check_getletter.php <percentage>\n";
        exit(1);
    }

    $res = executeQuery("SELECT GetLetterGrade(?) AS letter", [$p]);
    if (!empty($res) && isset($res[0]['letter'])) {
        echo "Letter for $p => " . $res[0]['letter'] . "\n";
    } else {
        echo "No result or function missing.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
