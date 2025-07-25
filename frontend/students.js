
const token = localStorage.getItem('token');
if (!token) {
  alert('🔒 Please login first');
  window.location.href = 'login.html';
}


// ========== STUDENT REGISTRATION ==========
document.getElementById('studentForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const studentClass = document.getElementById('class').value.trim();
  const age = parseInt(document.getElementById('age').value);
  const gender = document.getElementById('gender').value;
  const parent_name = document.getElementById('parent_name').value.trim();
  const parent_phone = document.getElementById('parent_phone').value.trim();
  const parent_email = document.getElementById('parent_email').value.trim();

  if (!name || !studentClass || !age || !gender || !parent_name || !parent_phone || !parent_email) {
    alert("Please fill in all fields correctly.");
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        class: studentClass,
        age,
        gender,
        parent_name,
        parent_phone,
        parent_email
      })
    });

    const result = await response.json();

    if (response.ok) {
      alert(`✅ Student Registered! ID: ${result.id}`);
      document.getElementById('studentForm').reset();
      fetchStudents();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  } catch (error) {
    console.error("Failed to register student:", error);
    alert("❌ Could not connect to the server.");
  }
});

// ========== FETCH STUDENT LIST ==========
async function fetchStudents() {
  try {
    const response = await fetch('http://localhost:3000/api/students');
    const students = await response.json();

    const tbody = document.querySelector('#studentTable tbody');
    tbody.innerHTML = '';

    students.forEach((student) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td>${student.class}</td>
        <td>${student.age}</td>
        <td>${student.gender}</td>
        <td>${student.parent_name}</td>
        <td>${student.parent_phone}</td>
        <td>${student.parent_email}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    alert("⚠️ Failed to load student data.");
  }
}

// ========== RESULT SUBMISSION ==========
document.getElementById('resultForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const student_id = parseInt(document.getElementById('resultStudentId').value);
  const subject = document.getElementById('subject').value;
  const ca1 = parseInt(document.getElementById('ca1').value);
  const ca2 = parseInt(document.getElementById('ca2').value);
  const exam = parseInt(document.getElementById('exam').value);
  const term = document.getElementById('term').value;
  const session = document.getElementById('session').value;

  try {
    const response = await fetch('http://localhost:3000/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id, subject, ca1, ca2, exam, term, session })
    });

    const result = await response.json();

    if (response.ok) {
      alert(`✅ Result recorded! Grade: ${result.grade}, Remark: ${result.remark}`);
      document.getElementById('resultForm').reset();
    } else {
      alert(`❌ Error: ${result.error}`);
    }
  } catch (error) {
    console.error("Failed to submit result:", error);
    alert("❌ Could not connect to the server.");
  }
});

// ========== BROADSHEET VIEW ==========
document.getElementById('broadsheetForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const term = document.getElementById('broadsheetTerm').value;
  const session = document.getElementById('broadsheetSession').value;

  try {
    const res = await fetch(`http://localhost:3000/api/results/broadsheet/${encodeURIComponent(term)}/${encodeURIComponent(session)}`);
    const data = await res.json();

    const container = document.getElementById('broadsheetContainer');
    container.innerHTML = '';

    if (data.length === 0) {
      container.innerHTML = '<p>No data found for selected term and session.</p>';
      return;
    }

    // Broadsheet to PDF
    document.getElementById('printBroadsheet').addEventListener('click', () => {
  const element = document.getElementById('broadsheetContainer');
  html2pdf().from(element).save('broadsheet.pdf');
});


    // Gather all subjects
    const subjects = new Set();
    data.forEach(student => {
      student.results.forEach(r => subjects.add(r.subject));
    });
    const subjectList = [...subjects];

    // Create table
    const table = document.createElement('table');
    table.border = '1';
    table.cellPadding = '8';
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    headRow.innerHTML = `
      <th>Student ID</th>
      <th>Name</th>
      <th>Class</th>
      ${subjectList.map(s => `<th>${s}</th>`).join('')}
      <th>Total</th>
      <th>Average</th>
      <th>Position</th>
    `;
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach(student => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${student.student_id}</td>
        <td>${student.name}</td>
        <td>${student.class}</td>
        ${subjectList.map(subject => {
          const found = student.results.find(r => r.subject === subject);
          return `<td>${found ? found.total : '-'}</td>`;
        }).join('')}
        <td>${student.total}</td>
        <td>${student.average}</td>
        <td>${student.position}</td>
      `;

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);

  } catch (err) {
    console.error("Failed to fetch broadsheet:", err);
    alert("❌ Could not load broadsheet.");
  }
});

// ========== PRINT BROADSHEET ==========
document.getElementById('printBroadsheet').addEventListener('click', function () {
  const content = document.getElementById('broadsheetContainer').innerHTML;

  const printWindow = window.open('', '', 'height=600,width=900');
  printWindow.document.write('<html><head><title>Class Broadsheet</title>');
  printWindow.document.write('<style>table { width: 100%; border-collapse: collapse; } th, td { padding: 8px; border: 1px solid black; text-align: center; }</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write('<h2>Class Broadsheet</h2>');
  printWindow.document.write(content);
  printWindow.document.write('</body></html>');

  printWindow.document.close();
  printWindow.print();
});

// ========== INIT ==========
window.onload = fetchStudents;
