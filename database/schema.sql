-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 20, 2026 at 03:04 PM
-- Server version: 10.11.16-MariaDB
-- PHP Version: 8.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `studyledger`
--

-- --------------------------------------------------------

--
-- Table structure for table `budgets`
--

CREATE TABLE `budgets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `month` char(7) NOT NULL,
  `limit_amount` decimal(10,2) NOT NULL,
  `initial_balance` decimal(12,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat_faq`
--

CREATE TABLE `chat_faq` (
  `id` int(11) NOT NULL,
  `category` varchar(50) NOT NULL,
  `keywords` varchar(500) NOT NULL,
  `answer` text NOT NULL,
  `next_steps` varchar(600) DEFAULT NULL,
  `link_label` varchar(60) DEFAULT NULL,
  `link_path` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat_history`
--

CREATE TABLE `chat_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `sender` enum('user','bot') NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `course_code` varchar(20) NOT NULL,
  `course_name` varchar(120) NOT NULL,
  `credit` decimal(3,1) NOT NULL,
  `grade_letter` varchar(3) DEFAULT NULL,
  `attendance_total` int(11) DEFAULT 0,
  `attendance_present` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `user_id`, `semester_id`, `course_code`, `course_name`, `credit`, `grade_letter`, `attendance_total`, `attendance_present`) VALUES
(10, 1, 1, 'cse 101', 'computer fundamental', 3.0, NULL, 0, 0),
(14, 1, 1, 'cse 417', 'computer grapich', 3.0, NULL, 0, 0),
(15, 6, 1, 'cse 101', 'computer fundamental', 3.0, NULL, 0, 0),
(16, 7, 1, 'cse 101', 'computer grapich', 3.0, NULL, 0, 0),
(17, 7, 1, 'cse 102', 'computer grapich', 3.0, NULL, 0, 0),
(18, 7, 1, 'cse 417', 'isd', 3.0, NULL, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `lessons`
--

CREATE TABLE `lessons` (
  `id` int(11) NOT NULL,
  `topic` enum('cpp','java','mysql') NOT NULL,
  `title` varchar(150) NOT NULL,
  `summary` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `code_example` text DEFAULT NULL,
  `common_mistakes` text DEFAULT NULL,
  `practice_tasks` text DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lesson_progress`
--

CREATE TABLE `lesson_progress` (
  `user_id` int(11) NOT NULL,
  `lesson_id` int(11) NOT NULL,
  `completed_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lesson_tips`
--

CREATE TABLE `lesson_tips` (
  `id` int(11) NOT NULL,
  `topic` enum('cpp','java','mysql','general') NOT NULL,
  `tip` varchar(300) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `marks`
--

CREATE TABLE `marks` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `type` enum('quiz','mid','assignment','final','lab','other') NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `obtained` decimal(6,2) NOT NULL,
  `total` decimal(6,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mess_bazaar_phases`
--

CREATE TABLE `mess_bazaar_phases` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `phase_number` tinyint(4) NOT NULL,
  `phase_label` varchar(50) NOT NULL,
  `date_range` varchar(60) NOT NULL,
  `member_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `note` varchar(255) DEFAULT '',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mess_bazaar_phases`
--

INSERT INTO `mess_bazaar_phases` (`id`, `user_id`, `phase_number`, `phase_label`, `date_range`, `member_id`, `amount`, `note`, `updated_at`) VALUES
(1, 7, 1, 'ধাপ ১', '১ - ৭ তারিখ', 1, 0.00, '', '2026-11-20 10:12:26'),
(2, 7, 2, 'ধাপ ২', '৭ - ১৪ তারিখ', 2, 0.00, '', '2026-11-20 10:12:26'),
(3, 7, 3, 'ধাপ ৩', '১৪ - ২১ তারিখ', 3, 0.00, '', '2026-11-20 10:12:26'),
(4, 7, 4, 'ধাপ ৪', '২১ - ২৮ তারিখ', 4, 0.00, '', '2026-11-20 10:12:26'),
(5, 7, 5, 'ধাপ ৫', '২৮ - ৩৫ তারিখ', 5, 0.00, '', '2026-11-20 10:12:26');

-- --------------------------------------------------------

--
-- Table structure for table `mess_daily_meals`
--

CREATE TABLE `mess_daily_meals` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `day_number` tinyint(4) NOT NULL,
  `member_id` int(11) NOT NULL,
  `meals` decimal(5,2) NOT NULL DEFAULT 0.00,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mess_daily_meals`
--

INSERT INTO `mess_daily_meals` (`id`, `user_id`, `day_number`, `member_id`, `meals`, `updated_at`) VALUES
(1, 7, 1, 1, 0.00, '2026-11-20 10:12:26'),
(2, 7, 1, 2, 0.00, '2026-11-20 10:12:26'),
(3, 7, 1, 3, 0.00, '2026-11-20 10:12:26'),
(4, 7, 1, 4, 0.00, '2026-11-20 10:12:26'),
(5, 7, 1, 5, 0.00, '2026-11-20 10:12:27'),
(6, 7, 2, 1, 0.00, '2026-11-20 10:12:27'),
(7, 7, 2, 2, 0.00, '2026-11-20 10:12:27'),
(8, 7, 2, 3, 0.00, '2026-11-20 10:12:27'),
(9, 7, 2, 4, 0.00, '2026-11-20 10:12:27'),
(10, 7, 2, 5, 0.00, '2026-11-20 10:12:27'),
(11, 7, 3, 1, 0.00, '2026-11-20 10:12:27'),
(12, 7, 3, 2, 0.00, '2026-11-20 10:12:27'),
(13, 7, 3, 3, 0.00, '2026-11-20 10:12:27'),
(14, 7, 3, 4, 0.00, '2026-11-20 10:12:27'),
(15, 7, 3, 5, 0.00, '2026-11-20 10:12:27'),
(16, 7, 4, 1, 0.00, '2026-11-20 10:12:27'),
(17, 7, 4, 2, 0.00, '2026-11-20 10:12:27'),
(18, 7, 4, 3, 0.00, '2026-11-20 10:12:27'),
(19, 7, 4, 4, 0.00, '2026-11-20 10:12:27'),
(20, 7, 4, 5, 0.00, '2026-11-20 10:12:27'),
(21, 7, 5, 1, 0.00, '2026-11-20 10:12:27'),
(22, 7, 5, 2, 0.00, '2026-11-20 10:12:27'),
(23, 7, 5, 3, 0.00, '2026-11-20 10:12:27'),
(24, 7, 5, 4, 0.00, '2026-11-20 10:12:27'),
(25, 7, 5, 5, 0.00, '2026-11-20 10:12:27'),
(26, 7, 6, 1, 0.00, '2026-11-20 10:12:27'),
(27, 7, 6, 2, 0.00, '2026-11-20 10:12:27'),
(28, 7, 6, 3, 0.00, '2026-11-20 10:12:27'),
(29, 7, 6, 4, 0.00, '2026-11-20 10:12:27'),
(30, 7, 6, 5, 0.00, '2026-11-20 10:12:27'),
(31, 7, 7, 1, 0.00, '2026-11-20 10:12:27'),
(32, 7, 7, 2, 0.00, '2026-11-20 10:12:27'),
(33, 7, 7, 3, 0.00, '2026-11-20 10:12:27'),
(34, 7, 7, 4, 0.00, '2026-11-20 10:12:27'),
(35, 7, 7, 5, 0.00, '2026-11-20 10:12:27'),
(36, 7, 8, 1, 0.00, '2026-11-20 10:12:27'),
(37, 7, 8, 2, 0.00, '2026-11-20 10:12:27'),
(38, 7, 8, 3, 0.00, '2026-11-20 10:12:27'),
(39, 7, 8, 4, 0.00, '2026-11-20 10:12:27'),
(40, 7, 8, 5, 0.00, '2026-11-20 10:12:27'),
(41, 7, 9, 1, 0.00, '2026-11-20 10:12:27'),
(42, 7, 9, 2, 0.00, '2026-11-20 10:12:27'),
(43, 7, 9, 3, 0.00, '2026-11-20 10:12:27'),
(44, 7, 9, 4, 0.00, '2026-11-20 10:12:27'),
(45, 7, 9, 5, 0.00, '2026-11-20 10:12:27'),
(46, 7, 10, 1, 0.00, '2026-11-20 10:12:27'),
(47, 7, 10, 2, 0.00, '2026-11-20 10:12:27'),
(48, 7, 10, 3, 0.00, '2026-11-20 10:12:27'),
(49, 7, 10, 4, 0.00, '2026-11-20 10:12:27'),
(50, 7, 10, 5, 0.00, '2026-11-20 10:12:27'),
(51, 7, 11, 1, 0.00, '2026-11-20 10:12:27'),
(52, 7, 11, 2, 0.00, '2026-11-20 10:12:27'),
(53, 7, 11, 3, 0.00, '2026-11-20 10:12:27'),
(54, 7, 11, 4, 0.00, '2026-11-20 10:12:27'),
(55, 7, 11, 5, 0.00, '2026-11-20 10:12:27'),
(56, 7, 12, 1, 0.00, '2026-11-20 10:12:27'),
(57, 7, 12, 2, 0.00, '2026-11-20 10:12:27'),
(58, 7, 12, 3, 0.00, '2026-11-20 10:12:27'),
(59, 7, 12, 4, 0.00, '2026-11-20 10:12:27'),
(60, 7, 12, 5, 0.00, '2026-11-20 10:12:27'),
(61, 7, 13, 1, 0.00, '2026-11-20 10:12:27'),
(62, 7, 13, 2, 0.00, '2026-11-20 10:12:27'),
(63, 7, 13, 3, 0.00, '2026-11-20 10:12:27'),
(64, 7, 13, 4, 0.00, '2026-11-20 10:12:27'),
(65, 7, 13, 5, 0.00, '2026-11-20 10:12:27'),
(66, 7, 14, 1, 0.00, '2026-11-20 10:12:27'),
(67, 7, 14, 2, 0.00, '2026-11-20 10:12:27'),
(68, 7, 14, 3, 0.00, '2026-11-20 10:12:27'),
(69, 7, 14, 4, 0.00, '2026-11-20 10:12:27'),
(70, 7, 14, 5, 0.00, '2026-11-20 10:12:27'),
(71, 7, 15, 1, 0.00, '2026-11-20 10:12:27'),
(72, 7, 15, 2, 0.00, '2026-11-20 10:12:27'),
(73, 7, 15, 3, 0.00, '2026-11-20 10:12:27'),
(74, 7, 15, 4, 0.00, '2026-11-20 10:12:27'),
(75, 7, 15, 5, 0.00, '2026-11-20 10:12:27'),
(76, 7, 16, 1, 0.00, '2026-11-20 10:12:27'),
(77, 7, 16, 2, 0.00, '2026-11-20 10:12:27'),
(78, 7, 16, 3, 0.00, '2026-11-20 10:12:27'),
(79, 7, 16, 4, 0.00, '2026-11-20 10:12:27'),
(80, 7, 16, 5, 0.00, '2026-11-20 10:12:27'),
(81, 7, 17, 1, 0.00, '2026-11-20 10:12:27'),
(82, 7, 17, 2, 0.00, '2026-11-20 10:12:27'),
(83, 7, 17, 3, 0.00, '2026-11-20 10:12:27'),
(84, 7, 17, 4, 0.00, '2026-11-20 10:12:27'),
(85, 7, 17, 5, 0.00, '2026-11-20 10:12:27'),
(86, 7, 18, 1, 0.00, '2026-11-20 10:12:27'),
(87, 7, 18, 2, 0.00, '2026-11-20 10:12:27'),
(88, 7, 18, 3, 0.00, '2026-11-20 10:12:27'),
(89, 7, 18, 4, 0.00, '2026-11-20 10:12:27'),
(90, 7, 18, 5, 0.00, '2026-11-20 10:12:27'),
(91, 7, 19, 1, 0.00, '2026-11-20 10:12:27'),
(92, 7, 19, 2, 0.00, '2026-11-20 10:12:27'),
(93, 7, 19, 3, 0.00, '2026-11-20 10:12:27'),
(94, 7, 19, 4, 0.00, '2026-11-20 10:12:27'),
(95, 7, 19, 5, 0.00, '2026-11-20 10:12:27'),
(96, 7, 20, 1, 0.00, '2026-11-20 10:12:27'),
(97, 7, 20, 2, 0.00, '2026-11-20 10:12:27'),
(98, 7, 20, 3, 0.00, '2026-11-20 10:12:27'),
(99, 7, 20, 4, 0.00, '2026-11-20 10:12:27'),
(100, 7, 20, 5, 0.00, '2026-11-20 10:12:27'),
(101, 7, 21, 1, 0.00, '2026-11-20 10:12:27'),
(102, 7, 21, 2, 0.00, '2026-11-20 10:12:27'),
(103, 7, 21, 3, 0.00, '2026-11-20 10:12:27'),
(104, 7, 21, 4, 0.00, '2026-11-20 10:12:27'),
(105, 7, 21, 5, 0.00, '2026-11-20 10:12:27'),
(106, 7, 22, 1, 0.00, '2026-11-20 10:12:27'),
(107, 7, 22, 2, 0.00, '2026-11-20 10:12:27'),
(108, 7, 22, 3, 0.00, '2026-11-20 10:12:27'),
(109, 7, 22, 4, 0.00, '2026-11-20 10:12:27'),
(110, 7, 22, 5, 0.00, '2026-11-20 10:12:27'),
(111, 7, 23, 1, 0.00, '2026-11-20 10:12:27'),
(112, 7, 23, 2, 0.00, '2026-11-20 10:12:27'),
(113, 7, 23, 3, 0.00, '2026-11-20 10:12:27'),
(114, 7, 23, 4, 0.00, '2026-11-20 10:12:27'),
(115, 7, 23, 5, 0.00, '2026-11-20 10:12:27'),
(116, 7, 24, 1, 0.00, '2026-11-20 10:12:27'),
(117, 7, 24, 2, 0.00, '2026-11-20 10:12:27'),
(118, 7, 24, 3, 0.00, '2026-11-20 10:12:27'),
(119, 7, 24, 4, 0.00, '2026-11-20 10:12:27'),
(120, 7, 24, 5, 0.00, '2026-11-20 10:12:27'),
(121, 7, 25, 1, 0.00, '2026-11-20 10:12:27'),
(122, 7, 25, 2, 0.00, '2026-11-20 10:12:27'),
(123, 7, 25, 3, 0.00, '2026-11-20 10:12:27'),
(124, 7, 25, 4, 0.00, '2026-11-20 10:12:27'),
(125, 7, 25, 5, 0.00, '2026-11-20 10:12:27'),
(126, 7, 26, 1, 0.00, '2026-11-20 10:12:27'),
(127, 7, 26, 2, 0.00, '2026-11-20 10:12:27'),
(128, 7, 26, 3, 0.00, '2026-11-20 10:12:27'),
(129, 7, 26, 4, 0.00, '2026-11-20 10:12:27'),
(130, 7, 26, 5, 0.00, '2026-11-20 10:12:27'),
(131, 7, 27, 1, 0.00, '2026-11-20 10:12:27'),
(132, 7, 27, 2, 0.00, '2026-11-20 10:12:27'),
(133, 7, 27, 3, 0.00, '2026-11-20 10:12:27'),
(134, 7, 27, 4, 0.00, '2026-11-20 10:12:27'),
(135, 7, 27, 5, 0.00, '2026-11-20 10:12:27'),
(136, 7, 28, 1, 0.00, '2026-11-20 10:12:27'),
(137, 7, 28, 2, 0.00, '2026-11-20 10:12:27'),
(138, 7, 28, 3, 0.00, '2026-11-20 10:12:27'),
(139, 7, 28, 4, 0.00, '2026-11-20 10:12:27'),
(140, 7, 28, 5, 0.00, '2026-11-20 10:12:27'),
(141, 7, 29, 1, 0.00, '2026-11-20 10:12:27'),
(142, 7, 29, 2, 0.00, '2026-11-20 10:12:27'),
(143, 7, 29, 3, 0.00, '2026-11-20 10:12:27'),
(144, 7, 29, 4, 0.00, '2026-11-20 10:12:27'),
(145, 7, 29, 5, 0.00, '2026-11-20 10:12:27'),
(146, 7, 30, 1, 0.00, '2026-11-20 10:12:27'),
(147, 7, 30, 2, 0.00, '2026-11-20 10:12:27'),
(148, 7, 30, 3, 0.00, '2026-11-20 10:12:27'),
(149, 7, 30, 4, 0.00, '2026-11-20 10:12:27'),
(150, 7, 30, 5, 0.00, '2026-11-20 10:12:27'),
(151, 7, 31, 1, 0.00, '2026-11-20 10:12:27'),
(152, 7, 31, 2, 0.00, '2026-11-20 10:12:27'),
(153, 7, 31, 3, 0.00, '2026-11-20 10:12:27'),
(154, 7, 31, 4, 0.00, '2026-11-20 10:12:27'),
(155, 7, 31, 5, 0.00, '2026-11-20 10:12:27'),
(156, 7, 32, 1, 0.00, '2026-11-20 10:12:27'),
(157, 7, 32, 2, 0.00, '2026-11-20 10:12:27'),
(158, 7, 32, 3, 0.00, '2026-11-20 10:12:27'),
(159, 7, 32, 4, 0.00, '2026-11-20 10:12:27'),
(160, 7, 32, 5, 0.00, '2026-11-20 10:12:27'),
(161, 7, 33, 1, 0.00, '2026-11-20 10:12:27'),
(162, 7, 33, 2, 0.00, '2026-11-20 10:12:27'),
(163, 7, 33, 3, 0.00, '2026-11-20 10:12:27'),
(164, 7, 33, 4, 0.00, '2026-11-20 10:12:27'),
(165, 7, 33, 5, 0.00, '2026-11-20 10:12:27'),
(166, 7, 34, 1, 0.00, '2026-11-20 10:12:27'),
(167, 7, 34, 2, 0.00, '2026-11-20 10:12:27'),
(168, 7, 34, 3, 0.00, '2026-11-20 10:12:27'),
(169, 7, 34, 4, 0.00, '2026-11-20 10:12:27'),
(170, 7, 34, 5, 0.00, '2026-11-20 10:12:27'),
(171, 7, 35, 1, 0.00, '2026-11-20 10:12:27'),
(172, 7, 35, 2, 0.00, '2026-11-20 10:12:27'),
(173, 7, 35, 3, 0.00, '2026-11-20 10:12:27'),
(174, 7, 35, 4, 0.00, '2026-11-20 10:12:27'),
(175, 7, 35, 5, 0.00, '2026-11-20 10:12:27');

-- --------------------------------------------------------

--
-- Table structure for table `mess_members`
--

CREATE TABLE `mess_members` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `member_slot` tinyint(4) NOT NULL DEFAULT 1,
  `name` varchar(100) NOT NULL,
  `extra_deposit` decimal(10,2) NOT NULL DEFAULT 0.00,
  `extra_addon` decimal(10,2) NOT NULL DEFAULT 0.00,
  `extra_note` varchar(255) DEFAULT '',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mess_members`
--

INSERT INTO `mess_members` (`id`, `user_id`, `member_slot`, `name`, `extra_deposit`, `extra_addon`, `extra_note`, `created_at`, `updated_at`) VALUES
(1, 7, 1, 'সদস্য 1', 0.00, 0.00, '', '2026-11-20 10:12:26', '2026-11-20 10:12:26'),
(2, 7, 2, 'সদস্য 2', 0.00, 0.00, '', '2026-11-20 10:12:26', '2026-11-20 10:12:26'),
(3, 7, 3, 'সদস্য 3', 0.00, 0.00, '', '2026-11-20 10:12:26', '2026-11-20 10:12:26'),
(4, 7, 4, 'সদস্য 4', 0.00, 0.00, '', '2026-11-20 10:12:26', '2026-11-20 10:12:26'),
(5, 7, 5, 'সদস্য 5', 0.00, 0.00, '', '2026-11-20 10:12:26', '2026-11-20 10:12:26');

-- --------------------------------------------------------

--
-- Table structure for table `mess_rules`
--

CREATE TABLE `mess_rules` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `sort_order` tinyint(4) NOT NULL DEFAULT 1,
  `rule_text` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mess_rules`
--

INSERT INTO `mess_rules` (`id`, `user_id`, `sort_order`, `rule_text`) VALUES
(1, 7, 1, 'কেউ যদি কোনো মেনু পরিবর্তন করে রান্না করতে বলে তাহলে ৫ জন সদস্যের অনুমতি নিয়ে রান্না করতে হবে, অন্যথায় ওই বাজার লিস্টে যুক্ত হবে না।'),
(2, 7, 2, 'নিজ দায়িত্বে কী কী বাজার আছে এবং কী কী বাজার প্রয়োজন, তা দেখে বাজার করতে হবে। সাথে সাথে লিস্ট গ্রুপে আপলোড করতে হবে।'),
(3, 7, 3, 'কেউ মাসে ৩ দিনের বেশি ডিম ভাজি বা নুডলস রান্না করতে পারবে না।');

-- --------------------------------------------------------

--
-- Table structure for table `mess_utility_bills`
--

CREATE TABLE `mess_utility_bills` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(120) NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mess_utility_bills`
--

INSERT INTO `mess_utility_bills` (`id`, `user_id`, `title`, `amount`, `created_at`, `updated_at`) VALUES
(1, 7, 'বাসা খরচ (ভাড়া)', 0.00, '2026-11-20 10:12:26', '2026-11-20 10:12:26'),
(2, 7, 'বুয়া বিল', 0.00, '2026-11-20 10:12:26', '2026-11-20 10:12:26'),
(3, 7, 'ওয়াইফাই বিল', 0.00, '2026-11-20 10:12:26', '2026-11-20 10:12:26'),
(4, 7, 'বিদ্যুৎ বিল', 0.00, '2026-11-20 10:12:26', '2026-11-20 10:12:26'),
(5, 7, 'গ্যাস বিল', 0.00, '2026-11-20 10:12:26', '2026-11-20 10:12:26');

-- --------------------------------------------------------

--
-- Table structure for table `mess_weekly_menu`
--

CREATE TABLE `mess_weekly_menu` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `day_index` tinyint(4) NOT NULL,
  `weekday` varchar(20) NOT NULL,
  `morning_menu` varchar(255) NOT NULL,
  `night_menu` varchar(255) NOT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mess_weekly_menu`
--

INSERT INTO `mess_weekly_menu` (`id`, `user_id`, `day_index`, `weekday`, `morning_menu`, `night_menu`, `updated_at`) VALUES
(1, 7, 0, 'শনি', 'ডিম ভুনা + সবজি', 'মাছ + ভাজি', '2026-11-20 10:12:26'),
(2, 7, 1, 'রবি', 'মুরগি + শাঁক', 'ডিম ভুনা + ডাল', '2026-11-20 10:12:26'),
(3, 7, 2, 'সোম', 'মাছ + ভাজি', 'মুরগি + শাঁক', '2026-11-20 10:12:26'),
(4, 7, 3, 'মঙ্গল', 'ডিম ভুনা + সবজি', 'খিচুড়ি + সালাদ + মুরগি মাংস', '2026-11-20 10:12:26'),
(5, 7, 4, 'বুধ', 'মাছ + ভাজি', 'ডিম ভাজা + ডাল', '2026-11-20 10:12:26'),
(6, 7, 5, 'বৃহঃ', 'মুরগি + ভাজি', 'মাছ + ভর্তা', '2026-11-20 10:12:26'),
(7, 7, 6, 'শুক্র', 'ডিম ভুনা + ডাল', 'মুরগি + ভাজি', '2026-11-20 10:12:26');

-- --------------------------------------------------------

--
-- Table structure for table `semesters`
--

CREATE TABLE `semesters` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_current` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `semesters`
--

INSERT INTO `semesters` (`id`, `user_id`, `name`, `sort_order`, `is_current`) VALUES
(1, 1, 'Default Semester', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('income','expense') NOT NULL,
  `category` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL CHECK (`amount` > 0),
  `txn_date` date NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `type`, `category`, `amount`, `txn_date`, `note`, `created_at`) VALUES
(1, 6, 'income', 'Tution', 1200.00, '0000-00-00', '', '2026-11-19 13:21:51'),
(2, 7, 'expense', 'Food', 1200.00, '0000-00-00', '', '2026-11-19 13:25:40'),
(3, 6, 'income', 'Food', 100.00, '0000-00-00', '', '2026-11-19 13:51:29');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `student_id` varchar(30) DEFAULT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `required_attendance` tinyint(4) DEFAULT 70,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `student_id`, `email`, `password_hash`, `required_attendance`, `created_at`) VALUES
(1, 'shishier ahamed ', NULL, 'shesheirahamedmd@gmail.com', '$2b$10$OOeP6PmmynACuv9lE.phd.ha6Je1iNbETbQZWXt/iqsRp5l8mi7VO', 70, '2026-11-09 13:19:22'),
(3, 'falgunuy', NULL, 'asdsa@gmial.com', '$2b$10$JbOH2nDwAoxYWor8Tl1aBOtISVTl.N6B7Rtf3vMZXtm0wRoUpg/Ze', 70, '2026-11-09 14:17:17'),
(4, 'shesheir1', NULL, 'abc@gmail.com', '$2b$10$WeoJhyxwhU2lBsAFFixLTekqpHyg94XgwvIQwiC2HVNan2yX/USEu', 70, '2026-11-09 14:18:04'),
(5, 'sisir', NULL, 'sisir@gmail.com', '$2b$10$zS75xTk8Hit3LELdabvg8.Iy/3UdqvI3rsNcvdYk2O0.rdYA1izdW', 70, '2026-11-09 14:56:50'),
(6, 'falguny', NULL, 'falguny@gmail.com', '$2b$10$mCMSoMX4rVqRA1TT6Q3J/Of.rLdU4UfiOdcrP1qgwNfhjpSz9FtOi', 70, '2026-11-19 11:37:13'),
(7, 'sisir', NULL, 'sisir1@gmail.com', '$2b$10$FYrAYnP9dBSYxsCVpjQq6.iEi3iiw9VjyO2XuGiQInPEIikxurhHG', 70, '2026-11-19 13:24:51');

-- --------------------------------------------------------

--
-- Table structure for table `user_cgpa`
--

CREATE TABLE `user_cgpa` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `current_cgpa` decimal(4,2) NOT NULL DEFAULT 0.00,
  `completed_credits` decimal(6,2) NOT NULL DEFAULT 0.00,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_cgpa`
--

INSERT INTO `user_cgpa` (`id`, `user_id`, `current_cgpa`, `completed_credits`, `updated_at`) VALUES
(1, 6, 4.00, 150.00, '2026-11-19 13:21:28'),
(2, 7, 3.19, 133.00, '2026-11-19 13:25:19');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `budgets`
--
ALTER TABLE `budgets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_month` (`user_id`,`month`);

--
-- Indexes for table `chat_faq`
--
ALTER TABLE `chat_faq`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `chat_history`
--
ALTER TABLE `chat_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `semester_id` (`semester_id`);

--
-- Indexes for table `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD PRIMARY KEY (`user_id`,`lesson_id`),
  ADD KEY `lesson_id` (`lesson_id`);

--
-- Indexes for table `lesson_tips`
--
ALTER TABLE `lesson_tips`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `marks`
--
ALTER TABLE `marks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `mess_bazaar_phases`
--
ALTER TABLE `mess_bazaar_phases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_phase` (`user_id`,`phase_number`),
  ADD KEY `member_id` (`member_id`);

--
-- Indexes for table `mess_daily_meals`
--
ALTER TABLE `mess_daily_meals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_day_member` (`user_id`,`day_number`,`member_id`),
  ADD KEY `member_id` (`member_id`);

--
-- Indexes for table `mess_members`
--
ALTER TABLE `mess_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_slot` (`user_id`,`member_slot`);

--
-- Indexes for table `mess_rules`
--
ALTER TABLE `mess_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `mess_utility_bills`
--
ALTER TABLE `mess_utility_bills`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `mess_weekly_menu`
--
ALTER TABLE `mess_weekly_menu`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_user_day_index` (`user_id`,`day_index`);

--
-- Indexes for table `semesters`
--
ALTER TABLE `semesters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_cgpa`
--
ALTER TABLE `user_cgpa`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `budgets`
--
ALTER TABLE `budgets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chat_faq`
--
ALTER TABLE `chat_faq`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chat_history`
--
ALTER TABLE `chat_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `lessons`
--
ALTER TABLE `lessons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lesson_tips`
--
ALTER TABLE `lesson_tips`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `marks`
--
ALTER TABLE `marks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mess_bazaar_phases`
--
ALTER TABLE `mess_bazaar_phases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `mess_daily_meals`
--
ALTER TABLE `mess_daily_meals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6651;

--
-- AUTO_INCREMENT for table `mess_members`
--
ALTER TABLE `mess_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `mess_rules`
--
ALTER TABLE `mess_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `mess_utility_bills`
--
ALTER TABLE `mess_utility_bills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `mess_weekly_menu`
--
ALTER TABLE `mess_weekly_menu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `semesters`
--
ALTER TABLE `semesters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `user_cgpa`
--
ALTER TABLE `user_cgpa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `budgets`
--
ALTER TABLE `budgets`
  ADD CONSTRAINT `budgets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_history`
--
ALTER TABLE `chat_history`
  ADD CONSTRAINT `chat_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `courses_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lesson_progress`
--
ALTER TABLE `lesson_progress`
  ADD CONSTRAINT `lesson_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lesson_progress_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `marks`
--
ALTER TABLE `marks`
  ADD CONSTRAINT `marks_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mess_bazaar_phases`
--
ALTER TABLE `mess_bazaar_phases`
  ADD CONSTRAINT `mess_bazaar_phases_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mess_bazaar_phases_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `mess_members` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `mess_daily_meals`
--
ALTER TABLE `mess_daily_meals`
  ADD CONSTRAINT `mess_daily_meals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mess_daily_meals_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `mess_members` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mess_members`
--
ALTER TABLE `mess_members`
  ADD CONSTRAINT `mess_members_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mess_rules`
--
ALTER TABLE `mess_rules`
  ADD CONSTRAINT `mess_rules_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mess_utility_bills`
--
ALTER TABLE `mess_utility_bills`
  ADD CONSTRAINT `mess_utility_bills_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mess_weekly_menu`
--
ALTER TABLE `mess_weekly_menu`
  ADD CONSTRAINT `mess_weekly_menu_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `semesters`
--
ALTER TABLE `semesters`
  ADD CONSTRAINT `semesters_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_cgpa`
--
ALTER TABLE `user_cgpa`
  ADD CONSTRAINT `fk_cgpa_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
