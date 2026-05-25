async function submitJobDescription() {

    const jobDescription =
        document.getElementById("jobDescription").value;

    const response = await fetch(
        "http://127.0.0.1:8000/analyze-job",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                job_description: jobDescription
            })
        }
    );

    const data = await response.json();

    document.getElementById("responseOutput").textContent =
        JSON.stringify(data, null, 2);
}