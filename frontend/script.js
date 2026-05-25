const API_BASE = "http://127.0.0.1:8000";

async function submitJobDescription() {
    const btn = document.getElementById("tailorBtn");
    const jobDescription = document.getElementById("jobDescription").value.trim();
    const loading = document.getElementById("loading");
    const error = document.getElementById("error");
    const result = document.getElementById("result");

    error.classList.add("hidden");
    result.classList.add("hidden");
    error.textContent = "";

    if (!jobDescription) {
        showError("Please paste a job description first.");
        return;
    }

    btn.disabled = true;
    loading.classList.remove("hidden");

    try {
        const response = await fetch(`${API_BASE}/analyze-job`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ job_description: jobDescription }),
        });

        const data = await response.json();

        if (data.error) {
            showError(data.error);
            return;
        }

        document.getElementById("responseOutput").textContent = data.resume;
        result.classList.remove("hidden");
    } catch (err) {
        showError("Failed to connect to the backend. Make sure the server is running on " + API_BASE);
    } finally {
        btn.disabled = false;
        loading.classList.add("hidden");
    }
}

function showError(msg) {
    const el = document.getElementById("error");
    el.textContent = msg;
    el.classList.remove("hidden");
}

function copyResume() {
    const text = document.getElementById("responseOutput").textContent;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById("copyBtn");
        btn.textContent = "Copied!";
        setTimeout(() => { btn.textContent = "Copy to Clipboard"; }, 2000);
    });
}
