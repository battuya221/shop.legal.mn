<?php
/** Enable W3 Total Cache */
define('WP_CACHE', true); // Added by W3 Total Cache

/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'regalmn_dbnameShoplast' );

/** MySQL database username */
define( 'DB_USER', 'regalmn_usernameShoplast' );

/** MySQL database password */
define( 'DB_PASSWORD', '3wC##-$NSl(;' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'GuyM;jTLUhNX&EU_vfP2C5 WD+~Oe]Vt4D+)_>**-sJYx}LQ];{0a_R;^5u&LGes' );
define( 'SECURE_AUTH_KEY',  '=#uX2P^3-CI&*k_0nkx>kozVp]/n*zS*#d6#K#YOGzy)5SO,F}n*,6`PND+r vl=' );
define( 'LOGGED_IN_KEY',    'rTNkr^Z~:{PXvd`c/PV0]YyD#kxuPgEN>]so`s0lF-(|<bg*P+/sXvYnw?TFvNyC' );
define( 'NONCE_KEY',        'VURl}_Zwk#<R`XFtCtwDn@`sqtoX)A%6k+-roFu`8M!2BE8RYm?R9hva7dxodF.b' );
define( 'AUTH_SALT',        ';.@i]#eA&_|]?GRp903D%!yo0JfJ_F<;wMV6du9)L7Gk7dUNEUFbMLOZwO%U+QvB' );
define( 'SECURE_AUTH_SALT', 'SLNOx|H^}m(pM6XdCqbO5=4+g0TKw3z|xc1g;DFvXP%@O0Y{QIWoOw(b>#}6O=~T' );
define( 'LOGGED_IN_SALT',   '5r3N}05 +w?xR}]f4h$vg&_oo`)sEw@{$~_x`jL@A9bk=/97:n@cc.y470_iduaD' );
define( 'NONCE_SALT',       'Hj}OVw_Rg jNxEFQ0FsSLBE~=bj/i^Z,$EB4[6-~Jb@EhSOVu:`Vki0Hxe_[bHZn' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
