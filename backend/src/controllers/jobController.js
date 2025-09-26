const pool = require('../config/database');

// Create a new job
const createJob = async (req, res) => {
  try {
    const {
      title,
      company, 
      location,
      description,
      requirements,
      salary_range,
      employment_type,
      skills
    } = req.body;

    const recruiter_id = req.user.id;

    // Basic validation
    if (!title || !company || !location || !description || !requirements) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    const result = await pool.query(
      `INSERT INTO jobs 
       (title, company, location, description, requirements, salary_range, employment_type, recruiter_id, skills) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        title, 
        company, 
        location, 
        description, 
        requirements, 
        salary_range, 
        employment_type, 
        recruiter_id, 
        JSON.stringify(skills || [])
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create job' 
    });
  }
};

// Get all jobs
const getAllJobs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, u.name as recruiter_name 
       FROM jobs j 
       LEFT JOIN users u ON j.recruiter_id = u.id 
       ORDER BY j.created_at DESC`
    );

    res.json({
      success: true,
      jobs: result.rows
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch jobs' 
    });
  }
};
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT j.*, u.name as recruiter_name, u.email as recruiter_email 
       FROM jobs j 
       LEFT JOIN users u ON j.recruiter_id = u.id 
       WHERE j.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Job not found' 
      });
    }

    res.json({ 
      success: true,
      job: result.rows[0] 
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch job' 
    });
  }
};

// تحديث وظيفة
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      company,
      location,
      description,
      requirements,
      salary_range,
      employment_type,
      skills
    } = req.body;

    // التحقق إذا كانت الوظيفة موجودة وتنتمي للمستخدم
    const jobResult = await pool.query(
      'SELECT * FROM jobs WHERE id = $1 AND recruiter_id = $2',
      [id, req.user.id]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Job not found or access denied' 
      });
    }

    const skillsArray = Array.isArray(skills) ? skills : [];

    const result = await pool.query(
      `UPDATE jobs 
       SET title = $1, company = $2, location = $3, description = $4, 
           requirements = $5, salary_range = $6, employment_type = $7, 
           skills = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND recruiter_id = $10
       RETURNING *`,
      [
        title, company, location, description, requirements,
        salary_range, employment_type, JSON.stringify(skillsArray),
        id, req.user.id
      ]
    );

    res.json({
      success: true,
      message: 'Job updated successfully',
      job: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update job' 
    });
  }
};

// حذف وظيفة
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    // التحقق إذا كانت الوظيفة موجودة وتنتمي للمستخدم
    const jobResult = await pool.query(
      'SELECT * FROM jobs WHERE id = $1 AND recruiter_id = $2',
      [id, req.user.id]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Job not found or access denied' 
      });
    }

    await pool.query(
      'DELETE FROM jobs WHERE id = $1 AND recruiter_id = $2',
      [id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete job' 
    });
  }
};

// تأكد من تصدير جميع الدوال
module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob
};

