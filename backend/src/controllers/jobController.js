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

module.exports = {
  createJob,
  getAllJobs
};