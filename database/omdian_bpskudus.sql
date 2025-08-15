-- =====================================================
-- OMDIAN BPS KABUPATEN KUDUS DATABASE SCHEMA
-- Database: omdian_bpskudus
-- =====================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `omdian_bpskudus` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `omdian_bpskudus`;

-- =====================================================
-- 1. TABLE: users (Tabel Pengguna/Pegawai)
-- =====================================================
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `nip` varchar(18) NOT NULL UNIQUE,
  `nama` varchar(100) NOT NULL,
  `pangkat` varchar(50) NOT NULL,
  `golongan` varchar(10) NOT NULL,
  `jabatan` varchar(100) NOT NULL,
  `pendidikan` varchar(50) NOT NULL,
  `nilai_skp` int(3) DEFAULT NULL,
  `hukuman_disiplin` enum('Tidak Pernah','Pernah') DEFAULT 'Tidak Pernah',
  `diklat_pim` enum('Belum','Sudah') DEFAULT 'Belum',
  `diklat_fungsional` enum('Belum','Sudah') DEFAULT 'Belum',
  `role` enum('pegawai','admin') DEFAULT 'pegawai',
  `status` enum('aktif','non_aktif') DEFAULT 'aktif',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_nip` (`nip`),
  INDEX `idx_username` (`username`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. TABLE: training_data (Tabel Data Pelatihan/Diklat)
-- =====================================================
CREATE TABLE `training_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `tema` varchar(255) NOT NULL,
  `penyelenggara` varchar(150) NOT NULL,
  `tanggal_mulai` date NOT NULL,
  `tanggal_selesai` date NOT NULL,
  `keterangan` text DEFAULT NULL,
  `sertifikat_filename` varchar(255) DEFAULT NULL,
  `sertifikat_path` varchar(500) DEFAULT NULL,
  `status` enum('selesai','berlangsung','dibatalkan') DEFAULT 'selesai',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_tanggal_mulai` (`tanggal_mulai`),
  INDEX `idx_penyelenggara` (`penyelenggara`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. TABLE: certificates (Tabel Sertifikat)
-- =====================================================
CREATE TABLE `certificates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `training_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`training_id`) REFERENCES `training_data`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_training_id` (`training_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. TABLE: user_sessions (Tabel Sesi Login)
-- =====================================================
CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `session_token` varchar(255) NOT NULL UNIQUE,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_session_token` (`session_token`),
  INDEX `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. TABLE: activity_logs (Tabel Log Aktivitas)
-- =====================================================
CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `activity_type` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_activity_type` (`activity_type`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. TABLE: system_settings (Tabel Pengaturan Sistem)
-- =====================================================
CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL UNIQUE,
  `setting_value` text DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert default admin user (Password: admin123 - hashed with bcrypt)
INSERT INTO `users` (`username`, `password`, `nip`, `nama`, `pangkat`, `golongan`, `jabatan`, `pendidikan`, `nilai_skp`, `hukuman_disiplin`, `diklat_pim`, `diklat_fungsional`, `role`) VALUES
('admin1', '$2b$10$8K1p/a0dF/8m8rHY7KfE4Og7J7TzEYwXNvJ5N5N5N5N5N5N5N5N5N', '196512101989031003', 'Drs. Ahmad Wijaya', 'Pembina', 'IV/a', 'Kepala Subbagian Umum', 'S1 Administrasi Negara', 95, 'Tidak Pernah', 'Sudah', 'Sudah', 'admin');

-- Insert demo employees (Password: password123 - hashed with bcrypt)
INSERT INTO `users` (`username`, `password`, `nip`, `nama`, `pangkat`, `golongan`, `jabatan`, `pendidikan`, `nilai_skp`, `hukuman_disiplin`, `diklat_pim`, `diklat_fungsional`, `role`) VALUES
('pegawai1', '$2b$10$8K1p/a0dF/8m8rHY7KfE4Og7J7TzEYwXNvJ5N5N5N5N5N5N5N5N5N', '196801011992031001', 'Budi Santoso', 'Penata Muda Tk. I', 'III/b', 'Statistisi Ahli Pertama', 'S1 Statistik', 85, 'Tidak Pernah', 'Belum', 'Sudah', 'pegawai'),
('pegawai2', '$2b$10$8K1p/a0dF/8m8rHY7KfE4Og7J7TzEYwXNvJ5N5N5N5N5N5N5N5N5N', '197505151998032002', 'Siti Aminah', 'Penata', 'III/c', 'Statistisi Ahli Muda', 'S1 Matematika', 92, 'Tidak Pernah', 'Sudah', 'Sudah', 'pegawai');

-- Insert demo training data
INSERT INTO `training_data` (`user_id`, `tema`, `penyelenggara`, `tanggal_mulai`, `tanggal_selesai`, `keterangan`, `status`) VALUES
(2, 'Pelatihan Analisis Data dengan SPSS', 'BPS Pusat', '2024-01-15', '2024-01-19', 'Pelatihan dasar penggunaan SPSS untuk analisis statistik', 'selesai'),
(2, 'Workshop Sensus Penduduk 2025', 'BPS Provinsi Jawa Tengah', '2024-02-10', '2024-02-12', 'Persiapan pelaksanaan Sensus Penduduk 2025', 'selesai'),
(3, 'Seminar Nasional Statistik Digital', 'Universitas Gadjah Mada', '2024-03-05', '2024-03-06', 'Seminar tentang transformasi digital dalam bidang statistik', 'selesai'),
(3, 'Pelatihan Leadership untuk ASN', 'LAN RI', '2024-04-01', '2024-04-05', 'Pelatihan kepemimpinan bagi Aparatur Sipil Negara', 'selesai');

-- Insert system settings
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `description`) VALUES
('app_name', 'OMDIAN', 'Nama aplikasi'),
('app_description', 'Pengembangan Kompetensi Diupdate Rutinan Pegawai BPS Kabupaten Kudus', 'Deskripsi aplikasi'),
('max_file_size', '5242880', 'Maksimal ukuran file upload (5MB dalam bytes)'),
('allowed_file_types', 'pdf,jpg,jpeg,png', 'Jenis file yang diizinkan untuk upload'),
('session_timeout', '3600', 'Timeout sesi dalam detik (1 jam)'),
('timezone', 'Asia/Jakarta', 'Zona waktu aplikasi');

-- =====================================================
-- CREATE VIEWS FOR REPORTING
-- =====================================================

-- View untuk laporan pelatihan per pegawai
CREATE VIEW `view_training_summary` AS
SELECT 
    u.id as user_id,
    u.nip,
    u.nama,
    u.jabatan,
    u.pangkat,
    u.golongan,
    COUNT(t.id) as total_training,
    COUNT(CASE WHEN YEAR(t.tanggal_mulai) = YEAR(CURDATE()) THEN 1 END) as training_tahun_ini,
    COUNT(CASE WHEN t.sertifikat_filename IS NOT NULL THEN 1 END) as training_dengan_sertifikat
FROM `users` u
LEFT JOIN `training_data` t ON u.id = t.user_id
WHERE u.role = 'pegawai' AND u.status = 'aktif'
GROUP BY u.id, u.nip, u.nama, u.jabatan, u.pangkat, u.golongan;

-- View untuk statistik keseluruhan
CREATE VIEW `view_statistics` AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'pegawai' AND status = 'aktif') as total_pegawai,
    (SELECT COUNT(*) FROM training_data) as total_training,
    (SELECT COUNT(*) FROM training_data WHERE YEAR(tanggal_mulai) = YEAR(CURDATE())) as training_tahun_ini,
    (SELECT COUNT(*) FROM training_data WHERE sertifikat_filename IS NOT NULL) as training_dengan_sertifikat,
    (SELECT COUNT(DISTINCT penyelenggara) FROM training_data) as total_penyelenggara,
    (SELECT COUNT(DISTINCT user_id) FROM training_data WHERE YEAR(tanggal_mulai) = YEAR(CURDATE())) as pegawai_sudah_training_tahun_ini;

-- =====================================================
-- CREATE STORED PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure untuk mendapatkan statistik pegawai
CREATE PROCEDURE GetEmployeeStatistics(IN employee_id INT)
BEGIN
    SELECT 
        COUNT(*) as total_training,
        COUNT(CASE WHEN YEAR(tanggal_mulai) = YEAR(CURDATE()) THEN 1 END) as training_tahun_ini,
        COUNT(CASE WHEN sertifikat_filename IS NOT NULL THEN 1 END) as training_dengan_sertifikat,
        COUNT(DISTINCT penyelenggara) as penyelenggara_berbeda,
        MIN(tanggal_mulai) as training_pertama,
        MAX(tanggal_selesai) as training_terakhir
    FROM training_data 
    WHERE user_id = employee_id;
END //

-- Procedure untuk mendapatkan pegawai yang belum training tahun ini
CREATE PROCEDURE GetEmployeesWithoutCurrentYearTraining()
BEGIN
    SELECT 
        u.id,
        u.nip,
        u.nama,
        u.jabatan,
        u.pangkat,
        u.golongan,
        COALESCE(last_training.last_training_date, 'Belum pernah') as training_terakhir
    FROM users u
    LEFT JOIN (
        SELECT 
            user_id,
            MAX(tanggal_selesai) as last_training_date
        FROM training_data 
        GROUP BY user_id
    ) last_training ON u.id = last_training.user_id
    WHERE u.role = 'pegawai' 
    AND u.status = 'aktif'
    AND u.id NOT IN (
        SELECT DISTINCT user_id 
        FROM training_data 
        WHERE YEAR(tanggal_mulai) = YEAR(CURDATE())
    )
    ORDER BY u.nama;
END //

DELIMITER ;

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Additional indexes for better performance
CREATE INDEX `idx_training_year` ON `training_data` (YEAR(`tanggal_mulai`));
CREATE INDEX `idx_user_role_status` ON `users` (`role`, `status`);
CREATE INDEX `idx_training_status` ON `training_data` (`status`);

-- =====================================================
-- GRANT PERMISSIONS (Optional - adjust as needed)
-- =====================================================

-- Create user for application (optional - adjust credentials as needed)
-- CREATE USER 'omdian_user'@'localhost' IDENTIFIED BY 'secure_password_here';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON omdian_bpskudus.* TO 'omdian_user'@'localhost';
-- FLUSH PRIVILEGES;

-- =====================================================
-- FINAL NOTES
-- =====================================================

/*
IMPORTANT NOTES:
1. Change default passwords after installation
2. Update the hashed passwords with proper bcrypt hashes
3. Configure proper database user permissions for production
4. Set up regular database backups
5. Monitor database performance and optimize queries as needed

DEFAULT LOGIN CREDENTIALS (Change after setup):
- Admin: admin1 / admin123
- Employee 1: pegawai1 / password123  
- Employee 2: pegawai2 / password123

NEXT STEPS:
1. Import this SQL file into your MySQL database
2. Update .env file with database credentials
3. Install bcrypt for password hashing
4. Test database connection
*/
