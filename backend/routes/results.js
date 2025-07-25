const express = require('express');
const router = express.Router();
const db = require('../database');

// ✅ POST: Submit a result
router.post('/', (req, res) => {
  const { student_id, subject, ca1, ca2, exam, term, session } = req.body;

  if (!student_id || !subject || isNaN(ca1) || isNaN(ca2) || isNaN(exam) || !term || !session) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  const total = ca1 + ca2 + exam;

  let grade, remark;
  if (total >= 70) {
    grade = 'A'; remark = 'Excellent';
  } else if (total >= 60) {
    grade = 'B'; remark = 'Very Good';
  } else if (total >= 50) {
    grade = 'C'; remark = 'Good';
  } else if (total >= 45) {
    grade = 'D'; remark = 'Fair';
  } else if (total >= 40) {
    grade = 'E'; remark = 'Poor';
  } else {
    grade = 'F'; remark = 'Fail';
  }

  const sql = `
    INSERT INTO results
    (student_id, subject, ca1, ca2, exam, total, grade, remark, term, session)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [student_id, subject, ca1, ca2, exam, total, grade, remark, term, session], function (err) {
    if (err) {
      console.error("❌ Insert error:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ grade, remark });
  });
});

// ✅ GET: Broadsheet with averages and position
router.get('/broadsheet/:term/:session', (req, res) => {
  const { term, session } = req.params;

  const sql = `
    SELECT s.id as student_id, s.name, s.class,
           r.subject, r.ca1, r.ca2, r.exam, r.total, r.grade
    FROM students s
    JOIN results r ON s.id = r.student_id
    WHERE r.term = ? AND r.session = ?
    ORDER BY s.id, r.subject
  `;

  db.all(sql, [term, session], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const broadsheet = {};

    rows.forEach(row => {
      const sid = row.student_id;

      if (!broadsheet[sid]) {
        broadsheet[sid] = {
          student_id: sid,
          name: row.name,
          class: row.class,
          results: [],
          total: 0,
          subjectCount: 0
        };
      }

      broadsheet[sid].results.push({
        subject: row.subject,
        ca1: row.ca1,
        ca2: row.ca2,
        exam: row.exam,
        total: row.total,
        grade: row.grade
      });

      broadsheet[sid].total += row.total;
      broadsheet[sid].subjectCount += 1;
    });

    const studentsArray = Object.values(broadsheet).map(student => {
      student.average = (student.total / student.subjectCount).toFixed(2);
      return student;
    });

    studentsArray.sort((a, b) => b.total - a.total);
    studentsArray.forEach((student, index) => {
      student.position = `${index + 1}${getOrdinalSuffix(index + 1)}`;
    });

    res.json(studentsArray);
  });
});

function getOrdinalSuffix(i) {
  const j = i % 10,
        k = i % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

module.exports = router;
