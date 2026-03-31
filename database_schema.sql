CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT') NOT NULL DEFAULT 'DOCTOR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    visit_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(50) PRIMARY KEY,
    mrn VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(20),
    admission_date DATE,
    ward VARCHAR(50),
    room VARCHAR(50),
    diagnosis TEXT,
    previous_wound TEXT,
    healing_time VARCHAR(100),
    diabetes VARCHAR(100),
    ulcer VARCHAR(100),
    bp VARCHAR(100),
    status ENUM('Active', 'Recovered') NOT NULL DEFAULT 'Active',
    user_id INT,
    doctor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS assessments (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    date DATETIME NOT NULL,
    wound_location VARCHAR(100),
    wound_type VARCHAR(100),
    wound_stage VARCHAR(50),
    length_cm DECIMAL(5, 2),
    width_cm DECIMAL(5, 2),
    depth_cm DECIMAL(5, 2),
    pain_level INT,
    notes TEXT,
    granulation_pct INT,
    epithelial_pct INT DEFAULT 0,
    slough_pct INT DEFAULT 0,
    eschar_pct INT DEFAULT 0,
    marker_data TEXT,
    doctor_suggestion TEXT,
    status VARCHAR(50),
    image_data LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    nurse_id INT NOT NULL,
    patient_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATETIME,
    status ENUM('PENDING', 'COMPLETED') DEFAULT 'PENDING',
    nurse_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (nurse_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
