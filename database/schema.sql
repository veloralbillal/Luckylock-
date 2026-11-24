-- ============================================================================
-- Lottery Winner — Complete MySQL 8.0+ Relational Database Schema
-- Compatible with MySQL 8.0+, MariaDB 10.6+, and cPanel / Shared Hosting
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL,
  `username` VARCHAR(64) NOT NULL,
  `full_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(160) NOT NULL,
  `phone` VARCHAR(32) NULL,
  `avatar_url` VARCHAR(2000) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'moderator', 'admin') NOT NULL DEFAULT 'user',
  `status` ENUM('active', 'blocked') NOT NULL DEFAULT 'active',
  `balance` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `spin_credits` INT UNSIGNED NOT NULL DEFAULT 1,
  `total_deposited` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `total_withdrawn` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `wins_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `security_pin_hash` VARCHAR(255) NULL,
  `pin_lock_enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_username` (`username`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_role_status` (`role`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `label` VARCHAR(120) NOT NULL,
  `type` ENUM('single', 'multi', 'syndicate') NOT NULL DEFAULT 'single',
  `default_prizes` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `lotteries` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(180) NOT NULL,
  `slug` VARCHAR(200) NOT NULL,
  `details` TEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `entry_fee` DECIMAL(12, 2) NOT NULL,
  `prize_amount` DECIMAL(15, 2) NOT NULL,
  `total_tickets` INT UNSIGNED NOT NULL,
  `sold_tickets` INT UNSIGNED NOT NULL DEFAULT 0,
  `draw_mode` ENUM('auto', 'auto_datetime', 'manual') NOT NULL DEFAULT 'auto',
  `status` ENUM('scheduled', 'active', 'closed', 'drawn', 'refunded', 'paused') NOT NULL DEFAULT 'active',
  `start_at` DATETIME NOT NULL,
  `end_at` DATETIME NOT NULL,
  `drawn_at` DATETIME NULL,
  `results_published` TINYINT(1) NOT NULL DEFAULT 0,
  `auto_refund_incomplete` TINYINT(1) NOT NULL DEFAULT 1,
  `created_by` VARCHAR(64) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lotteries_slug` (`slug`),
  KEY `idx_lotteries_status_dates` (`status`, `start_at`, `end_at`),
  KEY `idx_lotteries_category` (`category`),
  CONSTRAINT `fk_lotteries_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `prizes` (
  `id` VARCHAR(64) NOT NULL,
  `lottery_id` VARCHAR(64) NOT NULL,
  `rank_position` INT UNSIGNED NOT NULL,
  `title` VARCHAR(120) NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `winners_count` INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_prizes_lottery` (`lottery_id`, `rank_position`),
  CONSTRAINT `fk_prizes_lottery` FOREIGN KEY (`lottery_id`) REFERENCES `lotteries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `purchases` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `lottery_id` VARCHAR(64) NOT NULL,
  `quantity` INT UNSIGNED NOT NULL,
  `unit_price` DECIMAL(12, 2) NOT NULL,
  `total_amount` DECIMAL(15, 2) NOT NULL,
  `status` ENUM('completed', 'refunded') NOT NULL DEFAULT 'completed',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_purchases_user` (`user_id`, `created_at`),
  KEY `idx_purchases_lottery` (`lottery_id`),
  CONSTRAINT `fk_purchases_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_purchases_lottery` FOREIGN KEY (`lottery_id`) REFERENCES `lotteries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tickets` (
  `id` VARCHAR(64) NOT NULL,
  `purchase_id` VARCHAR(64) NOT NULL,
  `lottery_id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `ticket_number` VARCHAR(32) NOT NULL,
  `entry_fee` DECIMAL(12, 2) NOT NULL,
  `status` ENUM('pending', 'won', 'lost', 'refunded') NOT NULL DEFAULT 'pending',
  `prize_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `prize_rank` INT UNSIGNED NULL,
  `purchased_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tickets_number` (`ticket_number`),
  KEY `idx_tickets_lottery_status` (`lottery_id`, `status`),
  KEY `idx_tickets_user` (`user_id`, `purchased_at`),
  CONSTRAINT `fk_tickets_purchase` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tickets_lottery` FOREIGN KEY (`lottery_id`) REFERENCES `lotteries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tickets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payments` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `gateway` ENUM('bKash', 'Nagad', 'Rocket', 'Upay', 'Bank', 'USDT') NOT NULL,
  `sender_number` VARCHAR(64) NOT NULL,
  `trx_id` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected', 'refunded') NOT NULL DEFAULT 'pending',
  `verification_note` TEXT NULL,
  `verified_by` VARCHAR(64) NULL,
  `verified_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_payments_trx_id` (`trx_id`),
  KEY `idx_payments_user_status` (`user_id`, `status`),
  CONSTRAINT `fk_payments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payments_verifier` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `withdrawals` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `gateway` ENUM('bKash', 'Nagad', 'Rocket', 'Upay', 'Bank', 'USDT') NOT NULL,
  `target_account` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `fee` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `total_debit` DECIMAL(15, 2) NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `admin_note` TEXT NULL,
  `processed_by` VARCHAR(64) NULL,
  `processed_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_withdrawals_user_status` (`user_id`, `status`),
  CONSTRAINT `fk_withdrawals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_withdrawals_processor` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `lottery_results` (
  `id` VARCHAR(64) NOT NULL,
  `lottery_id` VARCHAR(64) NOT NULL,
  `draw_seed_hash` VARCHAR(128) NOT NULL,
  `winning_numbers_json` JSON NOT NULL,
  `total_tickets_entered` INT UNSIGNED NOT NULL,
  `total_payout` DECIMAL(15, 2) NOT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `drawn_by` VARCHAR(64) NULL,
  `drawn_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_results_lottery` (`lottery_id`),
  CONSTRAINT `fk_results_lottery` FOREIGN KEY (`lottery_id`) REFERENCES `lotteries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_results_actor` FOREIGN KEY (`drawn_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `winners` (
  `id` VARCHAR(64) NOT NULL,
  `lottery_id` VARCHAR(64) NOT NULL,
  `result_id` VARCHAR(64) NOT NULL,
  `ticket_id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `prize_id` VARCHAR(64) NULL,
  `rank_position` INT UNSIGNED NOT NULL,
  `prize_title` VARCHAR(120) NOT NULL,
  `prize_amount` DECIMAL(15, 2) NOT NULL,
  `ticket_number` VARCHAR(32) NOT NULL,
  `awarded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_winners_lottery` (`lottery_id`, `rank_position`),
  KEY `idx_winners_user` (`user_id`),
  CONSTRAINT `fk_winners_lottery` FOREIGN KEY (`lottery_id`) REFERENCES `lotteries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_winners_result` FOREIGN KEY (`result_id`) REFERENCES `lottery_results` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_winners_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_winners_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `direction` ENUM('credit', 'debit') NOT NULL,
  `category` ENUM('deposit', 'withdrawal', 'ticket_purchase', 'prize_payout', 'refund', 'signup_bonus', 'admin_adjustment') NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `balance_after` DECIMAL(15, 2) NOT NULL,
  `reference_id` VARCHAR(64) NULL,
  `gateway` VARCHAR(50) NULL,
  `description` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_transactions_user_date` (`user_id`, `created_at`),
  KEY `idx_transactions_category` (`category`),
  CONSTRAINT `fk_transactions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(180) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('info', 'success', 'warning', 'win') NOT NULL DEFAULT 'info',
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_read` (`user_id`, `is_read`, `created_at`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `banners` (
  `id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(180) NOT NULL,
  `subtitle` TEXT NOT NULL,
  `cta_label` VARCHAR(80) NULL,
  `cta_target` VARCHAR(120) NULL,
  `placement` ENUM('hero', 'announcement') NOT NULL DEFAULT 'announcement',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `settings` (
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(64) NOT NULL,
  `actor_id` VARCHAR(64) NULL,
  `actor_username` VARCHAR(64) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `target_type` VARCHAR(64) NOT NULL,
  `target_id` VARCHAR(64) NULL,
  `details_json` JSON NULL,
  `ip_address` VARCHAR(64) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_action_date` (`action`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `username` VARCHAR(64) NOT NULL,
  `full_name` VARCHAR(120) NOT NULL,
  `role` ENUM('user', 'moderator', 'admin') NOT NULL DEFAULT 'user',
  `message` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_chat_created` (`created_at`),
  CONSTRAINT `fk_chat_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ticket_reservations` (
  `id` VARCHAR(64) NOT NULL,
  `lottery_id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `slot_numbers_json` JSON NOT NULL,
  `status` ENUM('held', 'pending_payment') NOT NULL DEFAULT 'held',
  `payment_id` VARCHAR(64) NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reservations_lottery_status` (`lottery_id`, `status`, `expires_at`),
  CONSTRAINT `fk_reservations_lottery` FOREIGN KEY (`lottery_id`) REFERENCES `lotteries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reservations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reservations_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `shop_orders` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `item_id` VARCHAR(64) NOT NULL,
  `item_title` VARCHAR(160) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `reward_summary` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_shop_orders_user` (`user_id`, `created_at`),
  CONSTRAINT `fk_shop_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wheel_spins` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `segment_index` TINYINT UNSIGNED NOT NULL,
  `segment_label` VARCHAR(64) NOT NULL,
  `reward_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `reward_spins` INT UNSIGNED NOT NULL DEFAULT 0,
  `spin_type` ENUM('daily_free', 'spin_credit') NOT NULL DEFAULT 'daily_free',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wheel_spins_user` (`user_id`, `created_at`),
  CONSTRAINT `fk_wheel_spins_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `daily_task_claims` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `task_id` VARCHAR(64) NOT NULL,
  `claim_date` DATE NOT NULL,
  `reward_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `reward_spins` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_daily_task_user_date` (`user_id`, `task_id`, `claim_date`),
  CONSTRAINT `fk_daily_task_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
