async function searchWord(word = null) {
  const wordInputField = document.getElementById("wordInput");
  const wordInput = word || wordInputField.value;
  wordInputField.value = wordInput;
  const apiKey = "73bbc50c-2325-48c7-8a71-5f5537cd64e4";
  const url = `https://www.dictionaryapi.com/api/v3/references/sd3/json/${wordInput}?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);

    let nounDefs = [];
    let verbDefs = [];
    let adjDefs = [];
    let primaryType = "";
    let suggestions = "";

    // Suggestions
    if (Array.isArray(data) && data.length > 0) {
      if (typeof data[0] === "string") {
        suggestions =
          "Did you mean: " +
          data
            .slice(0, 20)
            .map(
              (suggestion) =>
                `<a href="#" onclick="searchWord('${suggestion}')">${suggestion}</a>`
            )
            .join(", ");
        document.getElementById("suggestions").innerHTML = suggestions;
        document.getElementById("suggestions").style.display = "block"; // Show suggestions
      } else {
        document.getElementById("suggestions").style.display = "none"; // Hide suggestions if word exists
        data.forEach((entry) => {
          if (entry.fl && entry.hwi && entry.shortdef) {
            let audio = "";
            if (entry.hwi.prs && entry.hwi.prs[0] && entry.hwi.prs[0].sound) {
              let audioKey = entry.hwi.prs[0].sound.audio;
              let subDir = audioKey.charAt(0);
              let audioUrl = `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subDir}/${audioKey}.mp3`;
              audio = `<br><audio controls><source src="${audioUrl}" type="audio/mpeg">Your browser does not support the audio element.</audio>`;
            }

            const wordFormat = `<strong>${entry.hwi.hw} (${
              entry.fl
            }):</strong>${audio}<br> ${entry.shortdef
              .map((def) => `- ${def}`)
              .join("<br>")}<br><br>`;
            if (entry.fl === "noun") {
              nounDefs.push(wordFormat);
              if (!primaryType) primaryType = "noun";
            } else if (entry.fl === "verb") {
              verbDefs.push(wordFormat);
              if (!primaryType) primaryType = "verb";
            } else if (entry.fl === "adjective") {
              adjDefs.push(wordFormat);
              if (!primaryType) primaryType = "adjective";
            }
          }
        });
      }
    }

    let displayText = "";
    if (primaryType === "verb") {
      displayText = [verbDefs, ...nounDefs, ...adjDefs].join("");
    } else if (primaryType === "noun") {
      displayText = [...nounDefs, ...verbDefs, ...adjDefs].join("");
    } else if (primaryType === "adjective") {
      displayText = [...adjDefs, ...nounDefs, ...verbDefs].join("");
    }

    document.getElementById("definitions").innerHTML =
      displayText || "No definition found.";

    if (!suggestions) {
      document.getElementById("suggestions").style.display = "none"; // Hide if no suggestions
    }
  } catch (error) {
    document.getElementById("definitions").innerText =
      "Error fetching definition.";
    document.getElementById("suggestions").style.display = "none"; // Hide in case of error
  }
}

// Use Enter to search
document.addEventListener("DOMContentLoaded", function () {
  // Add event listener for the Enter key
  document
    .getElementById("wordInput")
    .addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        event.preventDefault(); // Prevent form submission (if inside a form)
        searchWord(); // Trigger search function
      }
    });
});

// Remove previous word when clicked
function clearInput() {
  document.getElementById("wordInput").value = "";
}

