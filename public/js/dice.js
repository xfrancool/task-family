document.addEventListener("DOMContentLoaded", () => {
  const rollBtn = document.getElementById("rollDice");
  const clearBtn = document.getElementById("clearHistory");
  const resultP = document.getElementById("diceResult");
  const taskHistory = document.getElementById("taskHistory");
  const familySelect = document.getElementById("familySelect");
  const addFamilyBtn = document.getElementById("addFamily");

  // Lanzar dado
  rollBtn.addEventListener("click", async () => {
    const dice = Math.floor(Math.random() * 6) + 1;
    const selectedEmail = familySelect.value;

    try {
      let url;
      if (selectedEmail) {
        // Tirar dado para un familiar: no enviamos dice, backend elige aleatorio
        url = `/task/random-by-email/${selectedEmail}`;
      } else {
        // Tirar dado para mí
        url = `/task/random/${dice}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.task) {
        resultP.innerHTML = `Resultado del dado: ${dice} <br>- Tarea: <strong>${data.task.title}</strong><br>${data.task.description}`;

        const li = document.createElement("li");
        li.innerHTML = `<strong>${data.task.title}</strong><br>${data.task.description}`;

        if (
          taskHistory.querySelector("li") &&
          taskHistory.querySelector("li").textContent ===
            "No hay tareas lanzadas aún"
        ) {
          taskHistory.innerHTML = "";
        }
        taskHistory.prepend(li);
      } else {
        resultP.textContent =
          "No hay tareas nuevas disponibles para este miembro";
      }
    } catch (err) {
      console.error("Error en fetch:", err);
      resultP.textContent = "Error al obtener tarea";
    }
  });

  // Borrar historial
  clearBtn.addEventListener("click", async () => {
    const selectedEmail = familySelect.value;
    const url = selectedEmail
      ? `/tasks/clear/${selectedEmail}`
      : "/tasks/clear";

    try {
      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        taskHistory.innerHTML = "<li>No hay tareas lanzadas aún</li>";
        resultP.textContent = "Historial borrado ✅";
      }
    } catch (err) {
      console.error("Error al borrar historial:", err);
      resultP.textContent = "Error al borrar historial ❌";
    }
  });

  // Agregar familiar
  addFamilyBtn.addEventListener("click", async () => {
    const name = document.getElementById("familyName").value;
    const email = document.getElementById("familyEmail").value;
    if (!name || !email) return alert("Completa nombre y email");

    try {
      const res = await fetch("/family/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();

      if (data.success) {
        alert("Familiar agregado correctamente");
        location.reload(); // recarga la página para actualizar select
      } else {
        alert(data.error || "No se pudo agregar miembro");
      }
    } catch (err) {
      console.error(err);
      alert("Error al agregar familiar");
    }
  });

  // Cambiar historial al seleccionar familiar
  familySelect.addEventListener("change", async () => {
    const email = familySelect.value;
    if (!email) {
      location.reload(); // mostrar tu historial
      return;
    }

    try {
      const res = await fetch(`/user/tasks/${email}`);
      const data = await res.json();
      taskHistory.innerHTML = "";

      if (!data.tasks || data.tasks.length === 0) {
        taskHistory.innerHTML = "<li>No hay tareas lanzadas aún</li>";
        return;
      }

      data.tasks.forEach((task) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${task.title}</strong><br>${task.description}`;
        taskHistory.appendChild(li);
      });
    } catch (err) {
      console.error(err);
      taskHistory.innerHTML = "<li>Error al cargar tareas</li>";
    }
  });
});

// Toggle formulario de agregar familiar
const toggleFamilyBtn = document.getElementById("toggleFamilyForm");
const familyForm = document.querySelector(".family-form");

toggleFamilyBtn.addEventListener("click", () => {
  familyForm.classList.toggle("show");
});
