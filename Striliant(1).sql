-- Adminer 4.7.7 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin` (
  `adminId` int(11) NOT NULL AUTO_INCREMENT,
  `type` tinyint(1) NOT NULL DEFAULT '2' COMMENT '1-SuperAdmin,2-Admin',
  `firstname` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastname` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` char(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mobileno` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile` char(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `banner` char(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `about` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `password` char(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0-disable,1-active,2-verify',
  `authToken` text NOT NULL,
  `is_online` tinyint(1) NOT NULL DEFAULT '0',
  `socket_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`adminId`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `admin` (`adminId`, `type`, `firstname`, `lastname`, `username`, `email`, `mobileno`, `profile`, `banner`, `about`, `password`, `isActive`, `authToken`, `is_online`, `socket_id`, `created_at`, `updated_at`) VALUES
(1,	1,	'Shyam',	'Kukadia',	'admin',	'shyam@kukadia.co',	'+919081888555',	'upload/admin/92270-Frame_29.jpg',	'upload/admin/11852-163-37938-Frame_46.jpg',	'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for \'lorem ipsum\' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).\r\n',	'8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',	1,	'8109',	0,	'',	'2021-01-04 06:37:13',	'2021-01-04 06:37:13'),
(9,	2,	'Nikunj',	'Hapani',	'nikunj.admin',	'nikunj@rentechdigital.com',	'7567793250',	NULL,	NULL,	'It is a long established fact that a reader will be distracted by the readable content of a page where It is a long established fact that a reader will be distracted by the readable content of a page.',	'8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',	1,	'',	0,	NULL,	'2021-02-04 09:19:24',	'2021-02-04 09:19:24')
ON DUPLICATE KEY UPDATE `adminId` = VALUES(`adminId`), `type` = VALUES(`type`), `firstname` = VALUES(`firstname`), `lastname` = VALUES(`lastname`), `username` = VALUES(`username`), `email` = VALUES(`email`), `mobileno` = VALUES(`mobileno`), `profile` = VALUES(`profile`), `banner` = VALUES(`banner`), `about` = VALUES(`about`), `password` = VALUES(`password`), `isActive` = VALUES(`isActive`), `authToken` = VALUES(`authToken`), `is_online` = VALUES(`is_online`), `socket_id` = VALUES(`socket_id`), `created_at` = VALUES(`created_at`), `updated_at` = VALUES(`updated_at`);

DROP TABLE IF EXISTS `blog`;
CREATE TABLE `blog` (
  `blogId` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`blogId`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `blog` (`blogId`, `title`, `description`, `image`, `status`, `created_at`) VALUES
(2,	'Solid Gold',	'Solid Gold Is A Precious Metal That Will Not Oxidize Or Discolor Since It Is The Least Reactive Metal.Solid Gold Is A Precious Metal That Will Not Oxidize Or Discolor Since It Is The Least Reactive Metal.Solid Gold Is A Precious Metal That Will Not Oxidize Or Discolor Since It Is The Least Reactive Metal.',	'upload/blog/27684-blog-1.png',	1,	'2021-01-30 13:03:27'),
(4,	'High Quality',	'We Work With Expert Jewelers Who Use High Quality And Enduring Materials. From Precious Metals, Set With Genuine Gemstones And Ethically Sourced Diamonds.',	'upload/blog/46434-blog-3.png',	1,	'2021-02-01 05:46:46'),
(5,	'Gold Vermeil',	'For A Piece To Be Considered Gold Vermeil, The Gold Must Be A Minimum Of 10k And 1.5 Microns. We Use 18k Gold Layered On Sterling Silver.For A Piece To Be Considered Gold Vermeil, The Gold Must Be A Minimum Of 10k And 1.5 Microns. We Use 18k Gold Layered On Sterling Silver.',	'upload/blog/46278-blog-7.png',	1,	'2021-02-01 05:47:13'),
(6,	'High Quality',	'For A Piece To Be Considered Gold Vermeil, The Gold Must Be A Minimum Of 10k And 1.5 Microns. We Use 18k Gold Layered On Sterling Silver.For A Piece To Be Considered Gold Vermeil, The Gold Must Be A Minimum Of 10k And 1.5 Microns. We Use 18k Gold Layered On Sterling Silver.',	'upload/blog/62371-blog-9.png',	1,	'2021-02-01 05:47:46'),
(7,	'Gold Vermeil',	'For A Piece To Be Considered Gold Vermeil, The Gold Must Be A Minimum Of 10k And 1.5 Microns. We Use 18k Gold Layered On Sterling Silver.For A Piece To Be Considered Gold Vermeil, The Gold Must Be A Minimum Of 10k And 1.5 Microns. We Use 18k Gold Layered On Sterling Silver.',	'upload/blog/34045-blog-4.png',	1,	'2021-02-01 05:48:41')
ON DUPLICATE KEY UPDATE `blogId` = VALUES(`blogId`), `title` = VALUES(`title`), `description` = VALUES(`description`), `image` = VALUES(`image`), `status` = VALUES(`status`), `created_at` = VALUES(`created_at`);

DROP TABLE IF EXISTS `brands`;
CREATE TABLE `brands` (
  `brandId` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `profile` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`brandId`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `brands` (`brandId`, `title`, `profile`, `status`, `created_at`) VALUES
(1,	'brand',	'upload/brands/87332-ftr-brand-img-1.png',	1,	'2021-02-05 10:56:13'),
(2,	'brand',	'upload/brands/85859-ftr-brand-img-2.png',	1,	'2021-02-05 10:56:27'),
(3,	'brand',	'upload/brands/19006-ftr-brand-img-3.png',	1,	'2021-02-05 10:56:35'),
(4,	'brand',	'upload/brands/93065-ftr-brand-img-4.png',	1,	'2021-02-05 10:56:47')
ON DUPLICATE KEY UPDATE `brandId` = VALUES(`brandId`), `title` = VALUES(`title`), `profile` = VALUES(`profile`), `status` = VALUES(`status`), `created_at` = VALUES(`created_at`);

DROP TABLE IF EXISTS `buy_requests`;
CREATE TABLE `buy_requests` (
  `buy_requests_id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `shape_advanced` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size_general_from` double DEFAULT NULL,
  `size_general_to` double DEFAULT NULL,
  `color_fancy` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color_white_intensity_from` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color_white_intensity_to` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color_white_overtone` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color_white_color` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `clarity` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `inclusions_eye_clean` char(20) DEFAULT NULL,
  `inclusions_milky_from` char(20) DEFAULT NULL,
  `inclusions_milky_to` char(20) DEFAULT NULL,
  `open_inclusions` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `white_inclusions` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `black_inclusions` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shades` char(40) DEFAULT NULL,
  `finish_general_cut_from` char(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `finish_general_cut_to` char(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `finish_general_polish_from` char(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `finish_general_polish_to` char(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `finish_general_symmetry_from` char(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `finish_general_symmetry_to` char(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `finish_specific` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fluorescence_intensity` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grading_report` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` char(40) DEFAULT NULL,
  `specification` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price_ct_from` double DEFAULT NULL,
  `price_ct_to` double DEFAULT NULL,
  `price_total_from` double DEFAULT NULL,
  `price_total_to` double DEFAULT NULL,
  `price_rap_from` double DEFAULT NULL,
  `price_rap_to` double DEFAULT NULL,
  `show_only` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `per_depth_from` double DEFAULT NULL,
  `per_depth_to` double DEFAULT NULL,
  `per_table_from` double DEFAULT NULL,
  `per_table_to` double DEFAULT NULL,
  `metric_length_from` double DEFAULT NULL,
  `metric_length_to` double DEFAULT NULL,
  `metric_width_from` double DEFAULT NULL,
  `metric_width_to` double DEFAULT NULL,
  `metric_depth_from` double DEFAULT NULL,
  `metric_depth_to` double DEFAULT NULL,
  `ratio_from` double DEFAULT NULL,
  `ratio_to` double DEFAULT NULL,
  `preset_ratio` char(25) DEFAULT NULL,
  `crown_height_from` double DEFAULT NULL,
  `crown_height_to` double DEFAULT NULL,
  `crown_angle_from` double DEFAULT NULL,
  `crown_angle_to` double DEFAULT NULL,
  `pavilion_depth_from` double DEFAULT NULL,
  `pavilion_depth_to` double DEFAULT NULL,
  `pavilion_angle_from` double DEFAULT NULL,
  `pavilion_angle_to` double DEFAULT NULL,
  `girdle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `culet_size` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `culet_condition` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `treatment` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `symbols` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `symbol_checkbox` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notify_daily` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notify_immediately` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `comment` year(4) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0-deactive,1-active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`buy_requests_id`),
  KEY `userId` (`userId`),
  CONSTRAINT `buy_requests_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `buy_requests` (`buy_requests_id`, `userId`, `shape_advanced`, `size_general_from`, `size_general_to`, `color_fancy`, `color_white_intensity_from`, `color_white_intensity_to`, `color_white_overtone`, `color_white_color`, `clarity`, `inclusions_eye_clean`, `inclusions_milky_from`, `inclusions_milky_to`, `open_inclusions`, `white_inclusions`, `black_inclusions`, `shades`, `finish_general_cut_from`, `finish_general_cut_to`, `finish_general_polish_from`, `finish_general_polish_to`, `finish_general_symmetry_from`, `finish_general_symmetry_to`, `finish_specific`, `fluorescence_intensity`, `grading_report`, `location`, `specification`, `price_ct_from`, `price_ct_to`, `price_total_from`, `price_total_to`, `price_rap_from`, `price_rap_to`, `show_only`, `per_depth_from`, `per_depth_to`, `per_table_from`, `per_table_to`, `metric_length_from`, `metric_length_to`, `metric_width_from`, `metric_width_to`, `metric_depth_from`, `metric_depth_to`, `ratio_from`, `ratio_to`, `preset_ratio`, `crown_height_from`, `crown_height_to`, `crown_angle_from`, `crown_angle_to`, `pavilion_depth_from`, `pavilion_depth_to`, `pavilion_angle_from`, `pavilion_angle_to`, `girdle`, `culet_size`, `culet_condition`, `treatment`, `symbols`, `symbol_checkbox`, `notify_daily`, `notify_immediately`, `expiration_date`, `comment`, `status`, `created_at`, `updated_at`) VALUES
(14,	8,	'RD,PS,AC',	10,	20,	'D,E,F',	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	'EX',	'GD',	'GD',	'GD',	'FA',	'PO',	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	'no-treatment',	'contains',	NULL,	NULL,	NULL,	NULL,	NULL,	1,	'2021-02-16 05:26:47',	'2021-02-16 05:26:47'),
(15,	9,	'RD',	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	'no-treatment',	'contains',	NULL,	NULL,	NULL,	NULL,	NULL,	1,	'2021-03-01 05:09:13',	'2021-03-01 05:09:13'),
(16,	8,	'RD',	1,	1.25,	'E,F,G',	NULL,	NULL,	NULL,	NULL,	'VS1,VS2',	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	'no-treatment',	'contains',	NULL,	NULL,	NULL,	NULL,	NULL,	1,	'2021-03-02 11:14:36',	'2021-03-02 11:14:36')
ON DUPLICATE KEY UPDATE `buy_requests_id` = VALUES(`buy_requests_id`), `userId` = VALUES(`userId`), `shape_advanced` = VALUES(`shape_advanced`), `size_general_from` = VALUES(`size_general_from`), `size_general_to` = VALUES(`size_general_to`), `color_fancy` = VALUES(`color_fancy`), `color_white_intensity_from` = VALUES(`color_white_intensity_from`), `color_white_intensity_to` = VALUES(`color_white_intensity_to`), `color_white_overtone` = VALUES(`color_white_overtone`), `color_white_color` = VALUES(`color_white_color`), `clarity` = VALUES(`clarity`), `inclusions_eye_clean` = VALUES(`inclusions_eye_clean`), `inclusions_milky_from` = VALUES(`inclusions_milky_from`), `inclusions_milky_to` = VALUES(`inclusions_milky_to`), `open_inclusions` = VALUES(`open_inclusions`), `white_inclusions` = VALUES(`white_inclusions`), `black_inclusions` = VALUES(`black_inclusions`), `shades` = VALUES(`shades`), `finish_general_cut_from` = VALUES(`finish_general_cut_from`), `finish_general_cut_to` = VALUES(`finish_general_cut_to`), `finish_general_polish_from` = VALUES(`finish_general_polish_from`), `finish_general_polish_to` = VALUES(`finish_general_polish_to`), `finish_general_symmetry_from` = VALUES(`finish_general_symmetry_from`), `finish_general_symmetry_to` = VALUES(`finish_general_symmetry_to`), `finish_specific` = VALUES(`finish_specific`), `fluorescence_intensity` = VALUES(`fluorescence_intensity`), `grading_report` = VALUES(`grading_report`), `location` = VALUES(`location`), `specification` = VALUES(`specification`), `price_ct_from` = VALUES(`price_ct_from`), `price_ct_to` = VALUES(`price_ct_to`), `price_total_from` = VALUES(`price_total_from`), `price_total_to` = VALUES(`price_total_to`), `price_rap_from` = VALUES(`price_rap_from`), `price_rap_to` = VALUES(`price_rap_to`), `show_only` = VALUES(`show_only`), `per_depth_from` = VALUES(`per_depth_from`), `per_depth_to` = VALUES(`per_depth_to`), `per_table_from` = VALUES(`per_table_from`), `per_table_to` = VALUES(`per_table_to`), `metric_length_from` = VALUES(`metric_length_from`), `metric_length_to` = VALUES(`metric_length_to`), `metric_width_from` = VALUES(`metric_width_from`), `metric_width_to` = VALUES(`metric_width_to`), `metric_depth_from` = VALUES(`metric_depth_from`), `metric_depth_to` = VALUES(`metric_depth_to`), `ratio_from` = VALUES(`ratio_from`), `ratio_to` = VALUES(`ratio_to`), `preset_ratio` = VALUES(`preset_ratio`), `crown_height_from` = VALUES(`crown_height_from`), `crown_height_to` = VALUES(`crown_height_to`), `crown_angle_from` = VALUES(`crown_angle_from`), `crown_angle_to` = VALUES(`crown_angle_to`), `pavilion_depth_from` = VALUES(`pavilion_depth_from`), `pavilion_depth_to` = VALUES(`pavilion_depth_to`), `pavilion_angle_from` = VALUES(`pavilion_angle_from`), `pavilion_angle_to` = VALUES(`pavilion_angle_to`), `girdle` = VALUES(`girdle`), `culet_size` = VALUES(`culet_size`), `culet_condition` = VALUES(`culet_condition`), `treatment` = VALUES(`treatment`), `symbols` = VALUES(`symbols`), `symbol_checkbox` = VALUES(`symbol_checkbox`), `notify_daily` = VALUES(`notify_daily`), `notify_immediately` = VALUES(`notify_immediately`), `expiration_date` = VALUES(`expiration_date`), `comment` = VALUES(`comment`), `status` = VALUES(`status`), `created_at` = VALUES(`created_at`), `updated_at` = VALUES(`updated_at`);

DROP TABLE IF EXISTS `cart`;
CREATE TABLE `cart` (
  `cartId` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `diamondList` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cartId`),
  KEY `userId` (`userId`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `contact_us`;
CREATE TABLE `contact_us` (
  `contactId` int(11) NOT NULL AUTO_INCREMENT,
  `firstname` char(55) NOT NULL,
  `lastname` char(55) NOT NULL,
  `email` char(55) NOT NULL,
  `comment` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`contactId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `diamonds`;
CREATE TABLE `diamonds` (
  `diamond_id` int(11) NOT NULL AUTO_INCREMENT,
  `vendor_name` char(55) DEFAULT NULL,
  `vendor_id` char(55) DEFAULT NULL,
  `vendor_email` char(55) DEFAULT NULL,
  `vendor_stock_id` char(55) DEFAULT NULL,
  `adminId` int(11) NOT NULL,
  `diamond_type` char(20) DEFAULT NULL,
  `stock_number` varchar(200) DEFAULT NULL,
  `rap_price` double DEFAULT NULL,
  `vendor_back` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vendor_price_back` double DEFAULT NULL,
  `vendor_subtotal` double DEFAULT NULL,
  `sale_back` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sale_price_back` double DEFAULT NULL,
  `sale_subtotal` double DEFAULT NULL,
  `availability` char(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shape` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size` double DEFAULT NULL,
  `color` char(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `clarity` char(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cut` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `polish` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `symmetry` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fluor_intensity` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fluor_color` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meas_length` double DEFAULT NULL,
  `meas_width` double DEFAULT NULL,
  `meas_depth` double DEFAULT NULL,
  `depth_percent` double DEFAULT NULL,
  `table_percent` double DEFAULT NULL,
  `crown_angle` double DEFAULT NULL,
  `crown_height` double DEFAULT NULL,
  `pavillion_angle` double DEFAULT NULL,
  `pavillion_depth` double DEFAULT NULL,
  `girdle_condition` char(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `girdle_min` char(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `girdle_max` char(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `girdle_per` double DEFAULT NULL,
  `culet_condition` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `culet_size` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `treatment` char(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `laser_inscription` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `star_length` int(20) DEFAULT NULL,
  `lab` char(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `report_number` int(50) DEFAULT NULL,
  `report_date` date DEFAULT NULL,
  `lab_location` char(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `report_comment` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `symbols` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `fancy_color_intensity` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fancy_color_overtone` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fancy_color_dominant_color` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fancy_color_secondary_color` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `report_file` char(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diamond_img` char(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_link` char(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sarine_loupe` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seller_spec` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shade` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `milky` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `eye_clean` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `open_inclusions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `black_inclusions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `white_inclusions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `brands` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0-deactive,1-active',
  `featured_stone` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0-no,1-yes',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`diamond_id`),
  KEY `adminId` (`adminId`),
  CONSTRAINT `diamonds_ibfk_2` FOREIGN KEY (`adminId`) REFERENCES `admin` (`adminid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=187 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `diamonds` (`diamond_id`, `vendor_name`, `vendor_id`, `vendor_email`, `vendor_stock_id`, `adminId`, `diamond_type`, `stock_number`, `rap_price`, `vendor_back`, `vendor_price_back`, `vendor_subtotal`, `sale_back`, `sale_price_back`, `sale_subtotal`, `availability`, `country`, `state`, `city`, `shape`, `size`, `color`, `clarity`, `cut`, `polish`, `symmetry`, `fluor_intensity`, `fluor_color`, `meas_length`, `meas_width`, `meas_depth`, `depth_percent`, `table_percent`, `crown_angle`, `crown_height`, `pavillion_angle`, `pavillion_depth`, `girdle_condition`, `girdle_min`, `girdle_max`, `girdle_per`, `culet_condition`, `culet_size`, `treatment`, `laser_inscription`, `star_length`, `lab`, `report_number`, `report_date`, `lab_location`, `report_comment`, `symbols`, `fancy_color_intensity`, `fancy_color_overtone`, `fancy_color_dominant_color`, `fancy_color_secondary_color`, `report_file`, `diamond_img`, `video_link`, `sarine_loupe`, `seller_spec`, `shade`, `milky`, `eye_clean`, `open_inclusions`, `black_inclusions`, `white_inclusions`, `brands`, `status`, `featured_stone`, `created_at`, `updated_at`) VALUES
(180,	'SAGAR ENTERPRISE',	'KV-M-003',	'support@kukadia.co',	'85440',	1,	'Natural',	'KV-0003',	5700,	'-29.10',	4041.2999999999997,	5657.82,	'-22.10',	4440.3,	6216.42,	'NA',	'',	'',	'',	'RD',	1.4,	'J',	'VVS2',	'ID',	'EX',	'EX',	'',	'WHIT',	1,	0,	1,	1,	12,	42,	42,	42,	42,	'42',	'42',	'42',	42,	'42',	'42',	'42',	'N',	0,	'GIA',	459102950,	'0000-00-00',	'MUMBAI',	'N',	'N',	'N',	'N',	'N',	'N',	'upload/diamonds/80497-459102950.pdf',	'upload/diamonds/16828-85440.jpg',	'',	'N',	'N',	'N',	'N',	'N',	'N',	'N',	'N',	'null',	1,	0,	'2021-02-28 01:46:24',	'2021-02-28 01:46:24'),
(181,	'SAGAR ENTERPRISE',	'KV-M-002',	'support@kukadia.co',	'83350',	1,	'Natural',	'KV-0002',	11600,	'-40.10',	6948.4,	10422.599999999999,	'-33.10',	7760.4,	11640.599999999999,	'NA',	'',	'',	'',	'RD',	1.5,	'G',	'VVS2',	'EX',	'EX',	'EX',	'',	'WHIT',	1,	0,	1,	1,	12,	42,	42,	42,	42,	'42',	'42',	'42',	42,	'42',	'42',	'42',	'N',	0,	'GIA',	457048243,	NULL,	'MUMBAI',	'N',	'N',	'N',	'N',	'N',	'N',	'upload/diamonds/30316-457048243.pdf',	'upload/diamonds/61443-83350.jpg',	'https://www.youtube.com/watch?v=9xwazD5SyVg',	'N',	'N',	'N',	'N',	'N',	'N',	'N',	'N',	'null',	1,	1,	'2021-02-28 01:46:24',	'2021-02-28 01:46:24'),
(182,	'SAGAR ENTERPRISE',	'KV-M-001',	'support@kukadia.co',	'84869',	1,	'Natural',	'KV-0001',	19000,	'-47.10',	10051,	20102,	'-40.10',	11381,	22762,	'NA',	'',	'',	'',	'RD',	2,	'G',	'VVS1',	'VG',	'EX',	'VG',	'',	'WHIT',	1,	0,	1,	1,	12,	42,	42,	42,	42,	'42',	'42',	'42',	42,	'42',	'42',	'42',	'N',	0,	'GIA',	459102949,	NULL,	'MUMBAI',	'N',	'N',	'N',	'N',	'N',	'N',	'upload/diamonds/3740-459102949.pdf',	'upload/diamonds/60072-84869.jpg',	'upload/diamonds/22542-A0485_F1507_P2_Pink_Comp_1.mov',	'N',	'N',	'N',	'N',	'N',	'N',	'N',	'N',	'null',	1,	1,	'2021-02-28 01:46:24',	'2021-02-28 01:46:24'),
(183,	'SAGAR ENTERPRISE',	'KV-M-004',	'support@kukadia.co',	'81999',	1,	'Natural',	'KV-0004',	6100,	'-42.10',	3531.8999999999996,	4238.28,	'-35.10',	3958.8999999999996,	4750.679999999999,	'NA',	'',	'',	'',	'RD',	1.2,	'I',	'VS2',	'VG',	'EX',	'VG',	'',	'WHIT',	1,	0,	1,	1,	12,	42,	42,	42,	42,	'42',	'42',	'42',	42,	'42',	'42',	'42',	'N',	0,	'GIA',	444083043,	NULL,	'MUMBAI',	'N',	'N',	'N',	'N',	'N',	'N',	'upload/diamonds/11462-444083043.pdf',	'upload/diamonds/82389-81999.jpg',	'upload/diamonds/63362-A0485_F1507_P2_Pink_Comp_1.mov',	'N',	'N',	'N',	'N',	'N',	'N',	'N',	'N',	'null',	1,	1,	'2021-02-28 01:46:24',	'2021-02-28 01:46:24')
ON DUPLICATE KEY UPDATE `diamond_id` = VALUES(`diamond_id`), `vendor_name` = VALUES(`vendor_name`), `vendor_id` = VALUES(`vendor_id`), `vendor_email` = VALUES(`vendor_email`), `vendor_stock_id` = VALUES(`vendor_stock_id`), `adminId` = VALUES(`adminId`), `diamond_type` = VALUES(`diamond_type`), `stock_number` = VALUES(`stock_number`), `rap_price` = VALUES(`rap_price`), `vendor_back` = VALUES(`vendor_back`), `vendor_price_back` = VALUES(`vendor_price_back`), `vendor_subtotal` = VALUES(`vendor_subtotal`), `sale_back` = VALUES(`sale_back`), `sale_price_back` = VALUES(`sale_price_back`), `sale_subtotal` = VALUES(`sale_subtotal`), `availability` = VALUES(`availability`), `country` = VALUES(`country`), `state` = VALUES(`state`), `city` = VALUES(`city`), `shape` = VALUES(`shape`), `size` = VALUES(`size`), `color` = VALUES(`color`), `clarity` = VALUES(`clarity`), `cut` = VALUES(`cut`), `polish` = VALUES(`polish`), `symmetry` = VALUES(`symmetry`), `fluor_intensity` = VALUES(`fluor_intensity`), `fluor_color` = VALUES(`fluor_color`), `meas_length` = VALUES(`meas_length`), `meas_width` = VALUES(`meas_width`), `meas_depth` = VALUES(`meas_depth`), `depth_percent` = VALUES(`depth_percent`), `table_percent` = VALUES(`table_percent`), `crown_angle` = VALUES(`crown_angle`), `crown_height` = VALUES(`crown_height`), `pavillion_angle` = VALUES(`pavillion_angle`), `pavillion_depth` = VALUES(`pavillion_depth`), `girdle_condition` = VALUES(`girdle_condition`), `girdle_min` = VALUES(`girdle_min`), `girdle_max` = VALUES(`girdle_max`), `girdle_per` = VALUES(`girdle_per`), `culet_condition` = VALUES(`culet_condition`), `culet_size` = VALUES(`culet_size`), `treatment` = VALUES(`treatment`), `laser_inscription` = VALUES(`laser_inscription`), `star_length` = VALUES(`star_length`), `lab` = VALUES(`lab`), `report_number` = VALUES(`report_number`), `report_date` = VALUES(`report_date`), `lab_location` = VALUES(`lab_location`), `report_comment` = VALUES(`report_comment`), `symbols` = VALUES(`symbols`), `fancy_color_intensity` = VALUES(`fancy_color_intensity`), `fancy_color_overtone` = VALUES(`fancy_color_overtone`), `fancy_color_dominant_color` = VALUES(`fancy_color_dominant_color`), `fancy_color_secondary_color` = VALUES(`fancy_color_secondary_color`), `report_file` = VALUES(`report_file`), `diamond_img` = VALUES(`diamond_img`), `video_link` = VALUES(`video_link`), `sarine_loupe` = VALUES(`sarine_loupe`), `seller_spec` = VALUES(`seller_spec`), `shade` = VALUES(`shade`), `milky` = VALUES(`milky`), `eye_clean` = VALUES(`eye_clean`), `open_inclusions` = VALUES(`open_inclusions`), `black_inclusions` = VALUES(`black_inclusions`), `white_inclusions` = VALUES(`white_inclusions`), `brands` = VALUES(`brands`), `status` = VALUES(`status`), `featured_stone` = VALUES(`featured_stone`), `created_at` = VALUES(`created_at`), `updated_at` = VALUES(`updated_at`);

DROP TABLE IF EXISTS `diamonds_search_saved`;
CREATE TABLE `diamonds_search_saved` (
  `search_saved_id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `body` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`search_saved_id`),
  KEY `userId` (`userId`),
  CONSTRAINT `diamonds_search_saved_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userid`),
  CONSTRAINT `diamonds_search_saved_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `diamonds_search_saved` (`search_saved_id`, `userId`, `body`, `created_at`, `updated_at`) VALUES
(85,	9,	'{\"shape_basic\":\"\",\"shape_advanced\":[\"RD\",\"PS\"],\"size_general_from\":\"\",\"size_general_to\":\"\",\"size_specific\":[],\"color_fancy\":[],\"color_white_intensity_from\":\"\",\"color_white_intensity_to\":\"\",\"color_white_overtone\":\"\",\"color_white_color\":\"\",\"clarity\":[],\"finish_general_cut_from\":\"\",\"finish_general_cut_to\":\"\",\"finish_general_polish_from\":\"\",\"finish_general_polish_to\":\"\",\"finish_general_symmetry_from\":\"\",\"finish_general_symmetry_to\":\"\",\"finish_specific\":[],\"fluorescence_intensity\":[],\"grading_report\":[],\"location\":[],\"flexible_delivery\":\"\",\"company_code\":\"\",\"rating\":\"\",\"stock_number\":\"\",\"lot_number\":\"\",\"specification\":[],\"price_ct_from\":\"\",\"price_ct_to\":\"\",\"price_total_from\":\"\",\"price_total_to\":\"\",\"price_rap_from\":\"\",\"price_rap_to\":\"\",\"show_only\":[],\"my_notes\":[],\"media\":[],\"per_depth_from\":\"\",\"per_depth_to\":\"\",\"per_table_from\":\"\",\"per_table_to\":\"\",\"metric_length_from\":\"\",\"metric_length_to\":\"\",\"metric_width_from\":\"\",\"metric_width_to\":\"\",\"metric_depth_from\":\"\",\"metric_depth_to\":\"\",\"ratio_from\":\"\",\"ratio_to\":\"\",\"preset_ratio\":\"\",\"crown_height_from\":\"\",\"crown_height_to\":\"\",\"crown_angle_from\":\"\",\"crown_angle_to\":\"\",\"pavilion_depth_from\":\"\",\"pavilion_depth_to\":\"\",\"pavilion_angle_from\":\"\",\"pavilion_angle_to\":\"\",\"girdle\":[],\"culet_size\":[],\"culet_condition\":[],\"treatment\":\"no-treatment\",\"symbols\":\"contains\",\"brands\":[],\"category_code\":\"\",\"lab_report_number\":\"\",\"access_code\":\"\",\"symbol_checkbox\":[]}',	'2021-02-27 09:50:38',	'2021-02-27 09:50:38'),
(86,	8,	'{\"shape_basic\":\"\",\"shape_advanced\":[],\"size_general_from\":\"\",\"size_general_to\":\"\",\"size_specific\":[],\"color_fancy\":[\"D\",\"E\",\"F\"],\"color_white_intensity_from\":\"\",\"color_white_intensity_to\":\"\",\"color_white_overtone\":\"\",\"color_white_color\":\"\",\"clarity\":[],\"finish_general_cut_from\":\"\",\"finish_general_cut_to\":\"\",\"finish_general_polish_from\":\"\",\"finish_general_polish_to\":\"\",\"finish_general_symmetry_from\":\"\",\"finish_general_symmetry_to\":\"\",\"finish_specific\":[],\"fluorescence_intensity\":[],\"grading_report\":[],\"location\":[],\"flexible_delivery\":\"\",\"company_code\":\"\",\"rating\":\"\",\"stock_number\":\"\",\"lot_number\":\"\",\"specification\":[],\"price_ct_from\":\"\",\"price_ct_to\":\"\",\"price_total_from\":\"\",\"price_total_to\":\"\",\"price_rap_from\":\"\",\"price_rap_to\":\"\",\"show_only\":[],\"my_notes\":[],\"media\":[],\"per_depth_from\":\"\",\"per_depth_to\":\"\",\"per_table_from\":\"\",\"per_table_to\":\"\",\"metric_length_from\":\"\",\"metric_length_to\":\"\",\"metric_width_from\":\"\",\"metric_width_to\":\"\",\"metric_depth_from\":\"\",\"metric_depth_to\":\"\",\"ratio_from\":\"\",\"ratio_to\":\"\",\"preset_ratio\":\"\",\"crown_height_from\":\"\",\"crown_height_to\":\"\",\"crown_angle_from\":\"\",\"crown_angle_to\":\"\",\"pavilion_depth_from\":\"\",\"pavilion_depth_to\":\"\",\"pavilion_angle_from\":\"\",\"pavilion_angle_to\":\"\",\"girdle\":[],\"culet_size\":[],\"culet_condition\":[],\"treatment\":\"no-treatment\",\"symbols\":\"contains\",\"brands\":[],\"category_code\":\"\",\"lab_report_number\":\"\",\"access_code\":\"\",\"symbol_checkbox\":[]}',	'2021-02-27 09:51:47',	'2021-02-27 09:51:47'),
(87,	8,	'{\"shape_basic\":\"\",\"shape_advanced\":[\"RD\"],\"size_general_from\":\"\",\"size_general_to\":\"\",\"size_specific\":[],\"color_fancy\":[],\"color_white_intensity_from\":\"\",\"color_white_intensity_to\":\"\",\"color_white_overtone\":\"\",\"color_white_color\":\"\",\"clarity\":[],\"finish_general_cut_from\":\"\",\"finish_general_cut_to\":\"\",\"finish_general_polish_from\":\"\",\"finish_general_polish_to\":\"\",\"finish_general_symmetry_from\":\"\",\"finish_general_symmetry_to\":\"\",\"finish_specific\":[],\"fluorescence_intensity\":[],\"grading_report\":[],\"location\":[],\"flexible_delivery\":\"\",\"company_code\":\"\",\"rating\":\"\",\"stock_number\":\"\",\"lot_number\":\"\",\"specification\":[],\"price_ct_from\":\"\",\"price_ct_to\":\"\",\"price_total_from\":\"\",\"price_total_to\":\"\",\"price_rap_from\":\"\",\"price_rap_to\":\"\",\"show_only\":[],\"my_notes\":[],\"media\":[],\"per_depth_from\":\"\",\"per_depth_to\":\"\",\"per_table_from\":\"\",\"per_table_to\":\"\",\"metric_length_from\":\"\",\"metric_length_to\":\"\",\"metric_width_from\":\"\",\"metric_width_to\":\"\",\"metric_depth_from\":\"\",\"metric_depth_to\":\"\",\"ratio_from\":\"\",\"ratio_to\":\"\",\"preset_ratio\":\"\",\"crown_height_from\":\"\",\"crown_height_to\":\"\",\"crown_angle_from\":\"\",\"crown_angle_to\":\"\",\"pavilion_depth_from\":\"\",\"pavilion_depth_to\":\"\",\"pavilion_angle_from\":\"\",\"pavilion_angle_to\":\"\",\"girdle\":[],\"culet_size\":[],\"culet_condition\":[],\"treatment\":\"no-treatment\",\"symbols\":\"contains\",\"brands\":[],\"category_code\":\"\",\"lab_report_number\":\"\",\"access_code\":\"\",\"symbol_checkbox\":[]}',	'2021-02-27 10:09:33',	'2021-02-27 10:09:33'),
(88,	8,	'{\"shape_basic\":\"\",\"shape_advanced\":[\"RD\"],\"size_general_from\":\"\",\"size_general_to\":\"\",\"size_specific\":[],\"color_fancy\":[],\"color_white_intensity_from\":\"\",\"color_white_intensity_to\":\"\",\"color_white_overtone\":\"\",\"color_white_color\":\"\",\"clarity\":[],\"finish_general_cut_from\":\"\",\"finish_general_cut_to\":\"\",\"finish_general_polish_from\":\"\",\"finish_general_polish_to\":\"\",\"finish_general_symmetry_from\":\"\",\"finish_general_symmetry_to\":\"\",\"finish_specific\":[],\"fluorescence_intensity\":[],\"grading_report\":[],\"location\":[],\"flexible_delivery\":\"\",\"company_code\":\"\",\"rating\":\"\",\"stock_number\":\"\",\"lot_number\":\"\",\"specification\":[],\"price_ct_from\":\"\",\"price_ct_to\":\"\",\"price_total_from\":\"\",\"price_total_to\":\"\",\"price_rap_from\":\"\",\"price_rap_to\":\"\",\"show_only\":[],\"my_notes\":[],\"media\":[],\"per_depth_from\":\"\",\"per_depth_to\":\"\",\"per_table_from\":\"\",\"per_table_to\":\"\",\"metric_length_from\":\"\",\"metric_length_to\":\"\",\"metric_width_from\":\"\",\"metric_width_to\":\"\",\"metric_depth_from\":\"\",\"metric_depth_to\":\"\",\"ratio_from\":\"\",\"ratio_to\":\"\",\"preset_ratio\":\"\",\"crown_height_from\":\"\",\"crown_height_to\":\"\",\"crown_angle_from\":\"\",\"crown_angle_to\":\"\",\"pavilion_depth_from\":\"\",\"pavilion_depth_to\":\"\",\"pavilion_angle_from\":\"\",\"pavilion_angle_to\":\"\",\"girdle\":[],\"culet_size\":[],\"culet_condition\":[],\"treatment\":\"no-treatment\",\"symbols\":\"contains\",\"brands\":[],\"category_code\":\"\",\"lab_report_number\":\"\",\"access_code\":\"\",\"symbol_checkbox\":[]}',	'2021-02-27 12:21:41',	'2021-02-27 12:21:41'),
(89,	8,	'{\"shape_basic\":\"\",\"shape_advanced\":[\"RD\"],\"size_general_from\":\"\",\"size_general_to\":\"\",\"size_specific\":[],\"color_fancy\":[],\"color_white_intensity_from\":\"\",\"color_white_intensity_to\":\"\",\"color_white_overtone\":\"\",\"color_white_color\":\"\",\"clarity\":[],\"finish_general_cut_from\":\"\",\"finish_general_cut_to\":\"\",\"finish_general_polish_from\":\"\",\"finish_general_polish_to\":\"\",\"finish_general_symmetry_from\":\"\",\"finish_general_symmetry_to\":\"\",\"finish_specific\":[],\"fluorescence_intensity\":[],\"grading_report\":[],\"location\":[],\"flexible_delivery\":\"\",\"company_code\":\"\",\"rating\":\"\",\"stock_number\":\"\",\"lot_number\":\"\",\"specification\":[],\"price_ct_from\":\"\",\"price_ct_to\":\"\",\"price_total_from\":\"\",\"price_total_to\":\"\",\"price_rap_from\":\"\",\"price_rap_to\":\"\",\"show_only\":[],\"my_notes\":[],\"media\":[],\"per_depth_from\":\"\",\"per_depth_to\":\"\",\"per_table_from\":\"\",\"per_table_to\":\"\",\"metric_length_from\":\"\",\"metric_length_to\":\"\",\"metric_width_from\":\"\",\"metric_width_to\":\"\",\"metric_depth_from\":\"\",\"metric_depth_to\":\"\",\"ratio_from\":\"\",\"ratio_to\":\"\",\"preset_ratio\":\"\",\"crown_height_from\":\"\",\"crown_height_to\":\"\",\"crown_angle_from\":\"\",\"crown_angle_to\":\"\",\"pavilion_depth_from\":\"\",\"pavilion_depth_to\":\"\",\"pavilion_angle_from\":\"\",\"pavilion_angle_to\":\"\",\"girdle\":[],\"culet_size\":[],\"culet_condition\":[],\"treatment\":\"no-treatment\",\"symbols\":\"contains\",\"brands\":[],\"category_code\":\"\",\"lab_report_number\":\"\",\"access_code\":\"\",\"symbol_checkbox\":[]}',	'2021-02-28 01:54:12',	'2021-02-28 01:54:12'),
(90,	8,	'{\"shape_basic\":\"\",\"shape_advanced\":[\"RD\"],\"size_general_from\":\"\",\"size_general_to\":\"\",\"size_specific\":[],\"color_fancy\":[],\"color_white_intensity_from\":\"\",\"color_white_intensity_to\":\"\",\"color_white_overtone\":\"\",\"color_white_color\":\"\",\"clarity\":[],\"finish_general_cut_from\":\"\",\"finish_general_cut_to\":\"\",\"finish_general_polish_from\":\"\",\"finish_general_polish_to\":\"\",\"finish_general_symmetry_from\":\"\",\"finish_general_symmetry_to\":\"\",\"finish_specific\":[],\"fluorescence_intensity\":[],\"grading_report\":[],\"location\":[],\"flexible_delivery\":\"\",\"company_code\":\"\",\"rating\":\"\",\"stock_number\":\"\",\"lot_number\":\"\",\"specification\":[],\"price_ct_from\":\"\",\"price_ct_to\":\"\",\"price_total_from\":\"\",\"price_total_to\":\"\",\"price_rap_from\":\"\",\"price_rap_to\":\"\",\"show_only\":[],\"my_notes\":[],\"media\":[],\"per_depth_from\":\"\",\"per_depth_to\":\"\",\"per_table_from\":\"\",\"per_table_to\":\"\",\"metric_length_from\":\"\",\"metric_length_to\":\"\",\"metric_width_from\":\"\",\"metric_width_to\":\"\",\"metric_depth_from\":\"\",\"metric_depth_to\":\"\",\"ratio_from\":\"\",\"ratio_to\":\"\",\"preset_ratio\":\"\",\"crown_height_from\":\"\",\"crown_height_to\":\"\",\"crown_angle_from\":\"\",\"crown_angle_to\":\"\",\"pavilion_depth_from\":\"\",\"pavilion_depth_to\":\"\",\"pavilion_angle_from\":\"\",\"pavilion_angle_to\":\"\",\"girdle\":[],\"culet_size\":[],\"culet_condition\":[],\"treatment\":\"no-treatment\",\"symbols\":\"contains\",\"brands\":[],\"category_code\":\"\",\"lab_report_number\":\"\",\"access_code\":\"\",\"symbol_checkbox\":[]}',	'2021-02-28 01:57:15',	'2021-02-28 01:57:15'),
(91,	8,	'{\"shape_basic\":\"\",\"shape_advanced\":[\"RD\"],\"size_general_from\":\"\",\"size_general_to\":\"\",\"size_specific\":[],\"color_fancy\":[],\"color_white_intensity_from\":\"\",\"color_white_intensity_to\":\"\",\"color_white_overtone\":\"\",\"color_white_color\":\"\",\"clarity\":[],\"finish_general_cut_from\":\"\",\"finish_general_cut_to\":\"\",\"finish_general_polish_from\":\"\",\"finish_general_polish_to\":\"\",\"finish_general_symmetry_from\":\"\",\"finish_general_symmetry_to\":\"\",\"finish_specific\":[],\"fluorescence_intensity\":[],\"grading_report\":[],\"location\":[],\"flexible_delivery\":\"\",\"company_code\":\"\",\"rating\":\"\",\"stock_number\":\"\",\"lot_number\":\"\",\"specification\":[],\"price_ct_from\":\"\",\"price_ct_to\":\"\",\"price_total_from\":\"\",\"price_total_to\":\"\",\"price_rap_from\":\"\",\"price_rap_to\":\"\",\"show_only\":[],\"my_notes\":[],\"media\":[],\"per_depth_from\":\"\",\"per_depth_to\":\"\",\"per_table_from\":\"\",\"per_table_to\":\"\",\"metric_length_from\":\"\",\"metric_length_to\":\"\",\"metric_width_from\":\"\",\"metric_width_to\":\"\",\"metric_depth_from\":\"\",\"metric_depth_to\":\"\",\"ratio_from\":\"\",\"ratio_to\":\"\",\"preset_ratio\":\"\",\"crown_height_from\":\"\",\"crown_height_to\":\"\",\"crown_angle_from\":\"\",\"crown_angle_to\":\"\",\"pavilion_depth_from\":\"\",\"pavilion_depth_to\":\"\",\"pavilion_angle_from\":\"\",\"pavilion_angle_to\":\"\",\"girdle\":[],\"culet_size\":[],\"culet_condition\":[],\"treatment\":\"no-treatment\",\"symbols\":\"contains\",\"brands\":[],\"category_code\":\"\",\"lab_report_number\":\"\",\"access_code\":\"\",\"symbol_checkbox\":[]}',	'2021-03-03 06:48:41',	'2021-03-03 06:48:41'),
(92,	8,	'{\"shape_basic\":\"\",\"shape_advanced\":[\"RD\"],\"size_general_from\":\"\",\"size_general_to\":\"\",\"size_specific\":[],\"color_fancy\":[],\"color_white_intensity_from\":\"\",\"color_white_intensity_to\":\"\",\"color_white_overtone\":\"\",\"color_white_color\":\"\",\"clarity\":[],\"finish_general_cut_from\":\"\",\"finish_general_cut_to\":\"\",\"finish_general_polish_from\":\"\",\"finish_general_polish_to\":\"\",\"finish_general_symmetry_from\":\"\",\"finish_general_symmetry_to\":\"\",\"finish_specific\":[],\"fluorescence_intensity\":[],\"grading_report\":[],\"location\":[],\"flexible_delivery\":\"\",\"company_code\":\"\",\"rating\":\"\",\"stock_number\":\"\",\"lot_number\":\"\",\"specification\":[],\"price_ct_from\":\"\",\"price_ct_to\":\"\",\"price_total_from\":\"\",\"price_total_to\":\"\",\"price_rap_from\":\"\",\"price_rap_to\":\"\",\"show_only\":[],\"my_notes\":[],\"media\":[],\"per_depth_from\":\"\",\"per_depth_to\":\"\",\"per_table_from\":\"\",\"per_table_to\":\"\",\"metric_length_from\":\"\",\"metric_length_to\":\"\",\"metric_width_from\":\"\",\"metric_width_to\":\"\",\"metric_depth_from\":\"\",\"metric_depth_to\":\"\",\"ratio_from\":\"\",\"ratio_to\":\"\",\"preset_ratio\":\"\",\"crown_height_from\":\"\",\"crown_height_to\":\"\",\"crown_angle_from\":\"\",\"crown_angle_to\":\"\",\"pavilion_depth_from\":\"\",\"pavilion_depth_to\":\"\",\"pavilion_angle_from\":\"\",\"pavilion_angle_to\":\"\",\"girdle\":[],\"culet_size\":[],\"culet_condition\":[],\"treatment\":\"no-treatment\",\"symbols\":\"contains\",\"brands\":[],\"category_code\":\"\",\"lab_report_number\":\"\",\"access_code\":\"\",\"symbol_checkbox\":[]}',	'2021-03-03 06:49:16',	'2021-03-03 06:49:16')
ON DUPLICATE KEY UPDATE `search_saved_id` = VALUES(`search_saved_id`), `userId` = VALUES(`userId`), `body` = VALUES(`body`), `created_at` = VALUES(`created_at`), `updated_at` = VALUES(`updated_at`);

DROP TABLE IF EXISTS `email_templates`;
CREATE TABLE `email_templates` (
  `templateId` int(11) NOT NULL AUTO_INCREMENT,
  `email_name` char(55) NOT NULL,
  `email_subject` varchar(255) NOT NULL,
  `email_content` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`templateId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `email_templates` (`templateId`, `email_name`, `email_subject`, `email_content`, `created_at`, `updated_at`) VALUES
(1,	'Admin - Register',	'User Addition',	'Send as email to admin with approval request.',	'2021-02-22 11:02:15',	'2021-02-22 11:02:15'),
(2,	'Customer - Register',	'Confirmation Mail',	'Send Confirmation of account request to customer.',	'2021-02-22 11:19:08',	'2021-02-22 11:19:08')
ON DUPLICATE KEY UPDATE `templateId` = VALUES(`templateId`), `email_name` = VALUES(`email_name`), `email_subject` = VALUES(`email_subject`), `email_content` = VALUES(`email_content`), `created_at` = VALUES(`created_at`), `updated_at` = VALUES(`updated_at`);

DROP TABLE IF EXISTS `homepage_settings`;
CREATE TABLE `homepage_settings` (
  `home_setting_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` char(25) NOT NULL,
  `key` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`home_setting_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `homepage_settings` (`home_setting_id`, `name`, `key`, `status`, `created_at`) VALUES
(1,	'Milestones',	'milestones',	1,	'2021-02-05 11:12:35'),
(2,	'Testimonials',	'testimonials',	1,	'2021-02-05 11:13:37'),
(3,	'Blog',	'blog',	1,	'2021-02-05 11:13:54'),
(4,	'Brands',	'brands',	1,	'2021-02-05 11:14:07')
ON DUPLICATE KEY UPDATE `home_setting_id` = VALUES(`home_setting_id`), `name` = VALUES(`name`), `key` = VALUES(`key`), `status` = VALUES(`status`), `created_at` = VALUES(`created_at`);

DROP TABLE IF EXISTS `jewelry`;
CREATE TABLE `jewelry` (
  `jewelry_id` int(11) NOT NULL AUTO_INCREMENT,
  `jewelry_images` text,
  `jewelry_video_link` varchar(255) DEFAULT NULL,
  `jewelry_stock_number` varchar(255) NOT NULL,
  `jewelry_title` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `jewelry_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `jewelry_price` double NOT NULL,
  `jewelry_msrp` double DEFAULT NULL,
  `jewelry_memo` char(20) DEFAULT NULL,
  `jewelry_quantity` int(11) DEFAULT NULL,
  `jewelry_minimum_order` int(11) DEFAULT NULL,
  `jewelry_out_of_stock` int(11) DEFAULT NULL,
  `jewelry_type` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `jewelry_condition` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jewelry_state` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jewelry_collection` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jewelry_style` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jewelry_material` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jewelry_material_weight` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jewelry_material_karat` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jewelry_stone_type` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jewelry_brand` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jewelry_design` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jewelry_location` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `jewelry_currency` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `jewelry_lab` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jewelry_certificate` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jewelry_parent_stock_number` varchar(255) DEFAULT NULL,
  `jewelry_manufacture_date` date DEFAULT NULL,
  `jewelry_total_length` double DEFAULT NULL,
  `jewelry_total_width_mm` double DEFAULT NULL,
  `jewelry_total_width_gr` double DEFAULT NULL,
  `jewelry_tags` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `jewelry_upload_own_stock` char(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`jewelry_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `jewelry` (`jewelry_id`, `jewelry_images`, `jewelry_video_link`, `jewelry_stock_number`, `jewelry_title`, `jewelry_description`, `jewelry_price`, `jewelry_msrp`, `jewelry_memo`, `jewelry_quantity`, `jewelry_minimum_order`, `jewelry_out_of_stock`, `jewelry_type`, `jewelry_condition`, `jewelry_state`, `jewelry_collection`, `jewelry_style`, `jewelry_material`, `jewelry_material_weight`, `jewelry_material_karat`, `jewelry_stone_type`, `jewelry_brand`, `jewelry_design`, `jewelry_location`, `jewelry_currency`, `jewelry_lab`, `jewelry_certificate`, `jewelry_parent_stock_number`, `jewelry_manufacture_date`, `jewelry_total_length`, `jewelry_total_width_mm`, `jewelry_total_width_gr`, `jewelry_tags`, `jewelry_upload_own_stock`, `status`, `created_at`, `updated_at`) VALUES
(1,	'upload/jewelry/1610451810230-jewelry.png,upload/jewelry/1610451764783-jewelry.png',	'',	'654054454656',	'title',	'dfsf sdfesdfesfsef  errfsdfwe',	10,	500,	'',	50,	1,	0,	'Bracelets',	'New',	'Finished',	'Engagement',	'Antique',	'Black Silver',	'',	'',	'',	'',	'',	'India',	'',	'',	'',	'0',	NULL,	0,	0,	0,	'hii,how',	'true',	1,	'2021-01-12 08:24:16',	'2021-01-12 08:24:16'),
(2,	NULL,	NULL,	'43345',	'hii',	'gdfgdfg',	20,	NULL,	'TRUE',	10,	2,	NULL,	'Bracelets',	NULL,	NULL,	'Enagagement',	'Antique',	'Black Silver',	NULL,	NULL,	NULL,	NULL,	NULL,	'India',	'USD',	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	'0',	1,	'2021-01-13 05:21:13',	'2021-01-13 05:21:13')
ON DUPLICATE KEY UPDATE `jewelry_id` = VALUES(`jewelry_id`), `jewelry_images` = VALUES(`jewelry_images`), `jewelry_video_link` = VALUES(`jewelry_video_link`), `jewelry_stock_number` = VALUES(`jewelry_stock_number`), `jewelry_title` = VALUES(`jewelry_title`), `jewelry_description` = VALUES(`jewelry_description`), `jewelry_price` = VALUES(`jewelry_price`), `jewelry_msrp` = VALUES(`jewelry_msrp`), `jewelry_memo` = VALUES(`jewelry_memo`), `jewelry_quantity` = VALUES(`jewelry_quantity`), `jewelry_minimum_order` = VALUES(`jewelry_minimum_order`), `jewelry_out_of_stock` = VALUES(`jewelry_out_of_stock`), `jewelry_type` = VALUES(`jewelry_type`), `jewelry_condition` = VALUES(`jewelry_condition`), `jewelry_state` = VALUES(`jewelry_state`), `jewelry_collection` = VALUES(`jewelry_collection`), `jewelry_style` = VALUES(`jewelry_style`), `jewelry_material` = VALUES(`jewelry_material`), `jewelry_material_weight` = VALUES(`jewelry_material_weight`), `jewelry_material_karat` = VALUES(`jewelry_material_karat`), `jewelry_stone_type` = VALUES(`jewelry_stone_type`), `jewelry_brand` = VALUES(`jewelry_brand`), `jewelry_design` = VALUES(`jewelry_design`), `jewelry_location` = VALUES(`jewelry_location`), `jewelry_currency` = VALUES(`jewelry_currency`), `jewelry_lab` = VALUES(`jewelry_lab`), `jewelry_certificate` = VALUES(`jewelry_certificate`), `jewelry_parent_stock_number` = VALUES(`jewelry_parent_stock_number`), `jewelry_manufacture_date` = VALUES(`jewelry_manufacture_date`), `jewelry_total_length` = VALUES(`jewelry_total_length`), `jewelry_total_width_mm` = VALUES(`jewelry_total_width_mm`), `jewelry_total_width_gr` = VALUES(`jewelry_total_width_gr`), `jewelry_tags` = VALUES(`jewelry_tags`), `jewelry_upload_own_stock` = VALUES(`jewelry_upload_own_stock`), `status` = VALUES(`status`), `created_at` = VALUES(`created_at`), `updated_at` = VALUES(`updated_at`);

DROP TABLE IF EXISTS `message_attachments_master`;
CREATE TABLE `message_attachments_master` (
  `mam_id` int(11) NOT NULL AUTO_INCREMENT,
  `message_id` int(11) NOT NULL,
  `file_name` varchar(200) DEFAULT NULL,
  `file_name_o` varchar(200) DEFAULT NULL,
  `entry_date_time` datetime NOT NULL,
  PRIMARY KEY (`mam_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `message_master`;
CREATE TABLE `message_master` (
  `message_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `recipient_id` int(11) DEFAULT NULL,
  `message_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `message_status` tinyint(1) NOT NULL COMMENT '1 = sent , 2 = delivered , 3 = seen',
  `entry_date_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`)
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `message_master` (`message_id`, `user_id`, `recipient_id`, `message_content`, `message_status`, `entry_date_time`) VALUES
(79,	8,	1,	'Stock # : KV-0002, Shape : RD, Size : 1.5, Color : G, Clarity : VVS2, Cut : EX, Polish : EX, Symmetry : EX',	3,	'2021-02-22 14:00:57'),
(80,	8,	1,	'Order # : 11, Pieces : 20, Cts : 8.81, Avg Disc : -17.5%, Total Cr : $1781.93, Amount : $15698.8',	3,	'2021-02-26 12:25:55'),
(81,	8,	1,	'hey',	3,	'2021-02-26 14:29:52'),
(82,	8,	9,	'hii',	1,	'2021-02-27 15:46:26'),
(83,	8,	9,	'yhfghfh',	1,	'2021-02-27 11:24:24'),
(84,	8,	9,	'hello',	1,	'2021-02-27 11:26:48'),
(85,	8,	9,	'',	1,	'2021-02-27 11:26:59'),
(86,	8,	9,	'',	1,	'2021-02-27 11:27:13'),
(87,	8,	1,	'hello',	3,	'2021-02-27 11:33:54'),
(88,	8,	9,	'dgfg',	1,	'2021-03-04 06:46:01'),
(89,	8,	9,	'',	1,	'2021-03-04 06:46:24'),
(90,	8,	1,	'hii',	3,	'2021-03-04 12:51:34'),
(91,	1,	8,	'how',	3,	'2021-03-04 12:51:41')
ON DUPLICATE KEY UPDATE `message_id` = VALUES(`message_id`), `user_id` = VALUES(`user_id`), `recipient_id` = VALUES(`recipient_id`), `message_content` = VALUES(`message_content`), `message_status` = VALUES(`message_status`), `entry_date_time` = VALUES(`entry_date_time`);

DROP TABLE IF EXISTS `milestones`;
CREATE TABLE `milestones` (
  `milestonesId` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `profile` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`milestonesId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `milestones` (`milestonesId`, `title`, `description`, `profile`, `status`, `created_at`) VALUES
(1,	'2021',	'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',	'upload/milestones/15196-milestone-1.png',	1,	'2021-02-05 10:34:02'),
(2,	'2021',	'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',	'upload/milestones/51749-milestone-2.png',	1,	'2021-02-05 10:34:26'),
(3,	'2021',	'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',	'upload/milestones/3346-milestone-3.png',	1,	'2021-02-05 10:34:36')
ON DUPLICATE KEY UPDATE `milestonesId` = VALUES(`milestonesId`), `title` = VALUES(`title`), `description` = VALUES(`description`), `profile` = VALUES(`profile`), `status` = VALUES(`status`), `created_at` = VALUES(`created_at`);

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `item` text NOT NULL,
  `pieces` int(11) NOT NULL DEFAULT '0',
  `cts` double NOT NULL DEFAULT '0',
  `avg_disc` double NOT NULL DEFAULT '0',
  `total_cr` double NOT NULL DEFAULT '0',
  `total_price` double NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1-Pending,2-Completed,3-Cancel,4-Deleted',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`),
  KEY `userId` (`userId`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `orders` (`order_id`, `userId`, `item`, `pieces`, `cts`, `avg_disc`, `total_cr`, `total_price`, `status`, `created_at`, `updated_at`) VALUES
(13,	9,	'172,171,170,169',	4,	6.1,	-32.6,	6885.15,	41999.41,	1,	'2021-03-01 09:21:04',	'2021-03-01 09:21:04'),
(14,	9,	'171',	1,	2,	-40.1,	11381,	22762,	4,	'2021-03-01 09:50:59',	'2021-03-01 09:50:59')
ON DUPLICATE KEY UPDATE `order_id` = VALUES(`order_id`), `userId` = VALUES(`userId`), `item` = VALUES(`item`), `pieces` = VALUES(`pieces`), `cts` = VALUES(`cts`), `avg_disc` = VALUES(`avg_disc`), `total_cr` = VALUES(`total_cr`), `total_price` = VALUES(`total_price`), `status` = VALUES(`status`), `created_at` = VALUES(`created_at`), `updated_at` = VALUES(`updated_at`);

DROP TABLE IF EXISTS `subscribers`;
CREATE TABLE `subscribers` (
  `subscriber_id` int(11) NOT NULL AUTO_INCREMENT,
  `subscriber_email` char(55) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`subscriber_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `subscribers` (`subscriber_id`, `subscriber_email`, `created_at`) VALUES
(1,	'nikunj@gmail.com',	'2021-02-22 06:17:03'),
(2,	'test@gmail.com',	'2021-02-22 06:17:58'),
(3,	'test1@gmail.com',	'2021-02-22 06:21:01')
ON DUPLICATE KEY UPDATE `subscriber_id` = VALUES(`subscriber_id`), `subscriber_email` = VALUES(`subscriber_email`), `created_at` = VALUES(`created_at`);

DROP TABLE IF EXISTS `testimonials`;
CREATE TABLE `testimonials` (
  `testimonialsId` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `profile` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`testimonialsId`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `testimonials` (`testimonialsId`, `name`, `title`, `description`, `profile`, `status`, `created_at`) VALUES
(1,	'Mr. John deo',	'Chairman Of ISD, HongKong',	'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',	'upload/testimonials/92937-testimonial-pic-1.png',	1,	'2021-02-05 10:17:08'),
(2,	'Mr. John deo',	'Chairman Of ISD, HongKong',	'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',	'upload/testimonials/92937-testimonial-pic-1.png',	1,	'2021-02-05 10:17:08'),
(3,	'Mr. John deo',	'Chairman Of ISD, HongKong',	'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',	'upload/testimonials/92937-testimonial-pic-1.png',	0,	'2021-02-05 10:17:08'),
(4,	'Mr. John deo',	'Chairman Of ISD, HongKong',	'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',	'upload/testimonials/92937-testimonial-pic-1.png',	0,	'2021-02-05 10:17:08'),
(5,	'Mr. John deo',	'Chairman Of ISD, HongKong',	'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',	'upload/testimonials/92937-testimonial-pic-1.png',	0,	'2021-02-05 10:17:08')
ON DUPLICATE KEY UPDATE `testimonialsId` = VALUES(`testimonialsId`), `name` = VALUES(`name`), `title` = VALUES(`title`), `description` = VALUES(`description`), `profile` = VALUES(`profile`), `status` = VALUES(`status`), `created_at` = VALUES(`created_at`);

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `userId` int(11) NOT NULL AUTO_INCREMENT,
  `adminId` int(11) DEFAULT NULL,
  `firstname` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastname` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` char(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) NOT NULL,
  `birth_date` date DEFAULT NULL,
  `anniversary_date` date DEFAULT NULL,
  `mobile` char(15) DEFAULT NULL,
  `phone` char(15) DEFAULT NULL,
  `company_name` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `company_logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `designation` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_type` char(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` char(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` char(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` char(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zipcode` int(11) DEFAULT NULL,
  `address` text,
  `fax` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `any_reference` char(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_proof` varchar(255) DEFAULT NULL,
  `business_proof` varchar(255) DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `tags` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `isActive` tinyint(1) NOT NULL DEFAULT '0',
  `authToken` text,
  `accept_terms` enum('true','false') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `accept_newsletter` enum('true','false') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_online` tinyint(2) NOT NULL DEFAULT '0',
  `socket_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`userId`, `adminId`, `firstname`, `lastname`, `username`, `email`, `password`, `birth_date`, `anniversary_date`, `mobile`, `phone`, `company_name`, `company_logo`, `designation`, `business_type`, `country`, `state`, `city`, `zipcode`, `address`, `fax`, `any_reference`, `photo_proof`, `business_proof`, `notes`, `tags`, `isActive`, `authToken`, `accept_terms`, `accept_newsletter`, `is_online`, `socket_id`, `created_at`, `updated_at`) VALUES
(8,	1,	'Nikunj',	'Hapani',	'nikunj',	'nikunj@rentechdigital.com',	'8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',	'2021-01-22',	'2021-01-30',	'7567793250',	'7567793250',	'Rentech Digital',	'upload/profile/97473-2570-48455-Frame_48.png',	'Designer',	'Other',	'India',	'Gujarat',	'Surat',	395004,	'Angel Square',	'',	'Third Party Reference',	'upload/kyc/68114-81999.jpg',	'upload/kyc/67742-85440.jpg',	'',	'null',	1,	'2881',	'true',	'true',	1,	'lVbLz64UDvOmcR_SAAAk',	'2020-12-28 08:55:45',	'2021-03-04 08:47:07'),
(9,	1,	'Dhaval',	'Patel',	'dhaval',	'dhaval@rentechdigital.com',	'8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',	NULL,	NULL,	'7567793250',	NULL,	'Rentech',	NULL,	'Buyer',	'Diamond Manufacturer',	'India',	'Gujrat',	'Surat',	395004,	'Angel Square',	NULL,	NULL,	NULL,	NULL,	'gfgfbfb',	'hii,how',	1,	NULL,	'true',	'true',	0,	'KjDgoWpkGgSfAWcsAAEC',	'2021-01-21 05:01:55',	'2021-02-22 12:55:19'),
(11,	1,	'Savji',	'Dholakia',	'savji',	'savjidholakia@gmail.com',	'8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',	'2021-02-22',	'2021-02-22',	'7567793250',	'8780769796',	'Hari Krishna Exports',	'upload/logo/14722-kukadia-logo.png',	'CEO',	'Diamond Manufacturer',	'India',	'Gujarat',	'Surat',	395006,	'HK Hub',	'',	'Sales Person',	NULL,	NULL,	'',	'null',	0,	NULL,	'true',	'',	0,	NULL,	'2021-02-22 10:05:20',	'2021-03-01 05:26:17')
ON DUPLICATE KEY UPDATE `userId` = VALUES(`userId`), `adminId` = VALUES(`adminId`), `firstname` = VALUES(`firstname`), `lastname` = VALUES(`lastname`), `username` = VALUES(`username`), `email` = VALUES(`email`), `password` = VALUES(`password`), `birth_date` = VALUES(`birth_date`), `anniversary_date` = VALUES(`anniversary_date`), `mobile` = VALUES(`mobile`), `phone` = VALUES(`phone`), `company_name` = VALUES(`company_name`), `company_logo` = VALUES(`company_logo`), `designation` = VALUES(`designation`), `business_type` = VALUES(`business_type`), `country` = VALUES(`country`), `state` = VALUES(`state`), `city` = VALUES(`city`), `zipcode` = VALUES(`zipcode`), `address` = VALUES(`address`), `fax` = VALUES(`fax`), `any_reference` = VALUES(`any_reference`), `photo_proof` = VALUES(`photo_proof`), `business_proof` = VALUES(`business_proof`), `notes` = VALUES(`notes`), `tags` = VALUES(`tags`), `isActive` = VALUES(`isActive`), `authToken` = VALUES(`authToken`), `accept_terms` = VALUES(`accept_terms`), `accept_newsletter` = VALUES(`accept_newsletter`), `is_online` = VALUES(`is_online`), `socket_id` = VALUES(`socket_id`), `created_at` = VALUES(`created_at`), `updated_at` = VALUES(`updated_at`);

DROP TABLE IF EXISTS `watchlist`;
CREATE TABLE `watchlist` (
  `watchListId` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `diamondList` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`watchListId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `watchlist` (`watchListId`, `userId`, `diamondList`, `created_at`, `updated_at`) VALUES
(1,	8,	'180',	'2021-02-25 09:13:54',	'2021-02-25 09:13:54'),
(2,	9,	'171',	'2021-03-01 12:14:30',	'2021-03-01 12:14:30')
ON DUPLICATE KEY UPDATE `watchListId` = VALUES(`watchListId`), `userId` = VALUES(`userId`), `diamondList` = VALUES(`diamondList`), `created_at` = VALUES(`created_at`), `updated_at` = VALUES(`updated_at`);

-- 2021-03-04 09:18:04
