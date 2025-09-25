// FRONT-END (CLIENT) JAVASCRIPT



// ---------- FETCH WRESTLERS ----------
const fetchWrestlers = async () => {
    const response = await fetch("/wrestlers")
    const wrestlers = await response.json()
    updateTable(wrestlers);
};

// ---------- ADD / EDIT WRESTLER ----------
const submitWrestler = async (event) => {
    event.preventDefault();
    const name = document.querySelector("#Name").value;
    const weight = document.querySelector("#Weight").value;
    const wrestlerClass = document.querySelector("#Class").value;
    const wins = parseInt(document.querySelector("#Wins").value) || 0;
    const losses = parseInt(document.querySelector("#Losses").value) || 0
    const form = document.querySelector("#wrestlerForm");
    const body = { name, weight, class: wrestlerClass, wins, losses }

    let response;
    if (form.dataset.editing) {
        const id = form.dataset.editing;
        response = await fetch(`/wrestlers/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        delete form.dataset.editing;
        document.querySelector("#submitBtn").textContent = "Add Wrestler"
    } else {
        response = await fetch("/wrestlers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
    }

    const updatedData = await response.json()
    updateTable(updatedData)
    form.reset()
};

// ---------- DELETE ----------
const handleDelete = async (event) => {
    const id = event.target.dataset.id;
    const response = await fetch(`/wrestlers/${id}`, {
        method: "DELETE"
    });
    const updatedData = await response.json()
    updateTable(updatedData)
};

async function handleEdit(event) {
    const row = event.target.closest("tr")
    const id = row.dataset.id;

    const cells = row.querySelectorAll("td")

    const name = cells[0].innerText
    cells[0].innerHTML = `<input type="text" value="${name}">`

    const weight = cells[1].innerText
    const weightOptions = [125, 133, 141, 149, 157, 165, 174, 184, 197, 285]
    let weightSelect = `<select>`;
    weightOptions.forEach(w => {
        weightSelect += `<option value="${w}" ${w == weight ? "selected" : ""}>${w}</option>`
    });
    weightSelect += `</select>`
    cells[1].innerHTML = weightSelect;

    const wrestlerClass = cells[2].innerText
    const classOptions = ["Freshman", "Sophomore", "Junior", "Senior"]
    let classSelect = `<select>`
    classOptions.forEach(c => {
        classSelect += `<option value="${c}" ${c == wrestlerClass ? "selected" : ""}>${c}</option>`
    });
    classSelect += `</select>`
    cells[2].innerHTML = classSelect

    // --- Wins / Losses inputs ---
    const [wins, losses] = cells[3].innerText.split("-").map(Number);
    cells[3].innerHTML = `<input type="number" min="0" value="${wins}" style="width:50px">-<input type="number" min="0" value="${losses}" style="width:50px">`

    const actionCell = cells[4]
    actionCell.innerHTML = ""

    const saveBtn = document.createElement("button")
    saveBtn.textContent = "Save"
    const cancelBtn = document.createElement("button")
    cancelBtn.textContent = "Cancel"

    actionCell.appendChild(saveBtn)
    actionCell.appendChild(cancelBtn)

    // --- Save button listener ---
    saveBtn.addEventListener("click", async () => {
        const updatedData = {
            name: cells[0].querySelector("input").value,
            weight: cells[1].querySelector("select").value,
            class: cells[2].querySelector("select").value,
            wins: parseInt(cells[3].querySelectorAll("input")[0].value) || 0,
            losses: parseInt(cells[3].querySelectorAll("input")[1].value) || 0
        };

        try {
            const response = await fetch(`/wrestlers/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) throw new Error(await response.text());

            const data = await response.json();
            updateTable(data);
            showFeedback("Wrestler updated successfully!");
        } catch (err) {
            showFeedback("Update failed: " + err.message, true);
        }
    });

    // --- Cancel button listener ---
    cancelBtn.addEventListener("click", () => {
        fetchWrestlers(); // reset the row
    });
}



// ---------- UPDATE TABLE ----------
const updateTable = (data) => {
    const table = document.querySelector("#resultsTable");
    table.innerHTML = `
        <tr>
            <th>Name</th>
            <th>Weight</th>
            <th>Class</th>
            <th>Record</th>
            <th>Actions</th>
        </tr>
    `;

    data.forEach((wrestler) => {
        const row = document.createElement("tr")
        row.dataset.id = wrestler._id; 
        row.innerHTML = `
            <td>${wrestler.name}</td>
            <td>${wrestler.weight}</td>
            <td>${wrestler.class}</td>
            <td>${wrestler.wins}-${wrestler.losses}</td>
            <td>
                <button class="editBtn" data-id="${wrestler._id}">Edit</button>
                <button class="deleteBtn" data-id="${wrestler._id}">Delete</button>
            </td>
        `;
        table.appendChild(row);
    });

    document.querySelectorAll(".editBtn").forEach(btn => btn.addEventListener("click", handleEdit))
    document.querySelectorAll(".deleteBtn").forEach(btn => btn.addEventListener("click", handleDelete))
};

// ---------- INIT ----------
window.onload = () => {
    document.querySelector("#wrestlerForm").addEventListener("submit", submitWrestler);
    fetchWrestlers();
};

