/* ===== TEXT SCRAMBLE ===== */
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = "!<>-_\\/[]{}—=+*^?#________";
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => (this.resolve = resolve));
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || "";
            const to = newText[i] || "";
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frame);
        this.frame = requestAnimationFrame(this.update);
        return promise;
    }
    update() {
        let output = "";
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frameId >= end) {
                complete++;
                output += to;
            } else if (this.frameId >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.chars[Math.floor(Math.random() * this.chars.length)];
                    this.queue[i].char = char;
                }
                output += `<span class="scramble-char">${char}</span>`;
            } else {
                output += from;
            }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameId++;
            this.frame = requestAnimationFrame(this.update);
        }
    }
}

/* ===== BLOB PARALLAX ===== */
const blobs = document.querySelectorAll(".blob");

document.addEventListener("mousemove", (e) => {
    const mx = e.clientX - window.innerWidth / 2;
    const my = e.clientY - window.innerHeight / 2;
    blobs.forEach((blob, i) => {
        const speed = 0.015 * (i + 1);
        blob.style.transform = `translate(${mx * speed}px, ${my * speed}px)`;
    });
});

/* ===== BUTTON RIPPLE ===== */
document.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", function (e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement("span");
        ripple.className = "ripple";
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = e.clientX - rect.left - size / 2 + "px";
        ripple.style.top = e.clientY - rect.top - size / 2 + "px";
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});

/* ===== SCROLL REVEAL ===== */
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    },
    { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

/* ===== DOM READY ===== */
document.addEventListener("DOMContentLoaded", () => {
    const headline = document.getElementById("headline");
    if (headline) {
        const original = headline.innerText;
        const fx = new TextScramble(headline);
        fx.setText(original);
    }

    document.querySelectorAll(".stat-num").forEach((el) => {
        const target = parseInt(el.dataset.count);
        let current = 0;
        const step = Math.ceil(target / 30);
        const interval = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(interval);
            }
            el.textContent = current;
        }, 40);
    });
});

/* ===== SUBMIT ===== */
document.getElementById("tailorBtn").addEventListener("click", submitJobDescription);

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
        showError("Paste a job description first.");
        return;
    }

    btn.disabled = true;
    loading.classList.remove("hidden");

    try {
        const response = await fetch("/api/analyze-job", {
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
        result.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
        showError("Can't reach the backend. Is the server running?");
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
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
        setTimeout(() => {
            btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy to Clipboard`;
        }, 2000);
    });
}
