import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { toast } from "sonner";
import { FileSpreadsheet, Folder } from "lucide-react";

export default function YouTubeInputForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const isValidYouTubeUrl = (link) => {
    const pattern =
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=)?[\w\-]{11}/;
    return pattern.test(link);
  };

  // Load history dari localStorage saat pertama kali load
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("linkHistory")) || [];
    setHistory(saved);
  }, []);

  // Simpan otomatis ke localStorage setiap history berubah
  useEffect(() => {
    localStorage.setItem("linkHistory", JSON.stringify(history));
  }, [history]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidYouTubeUrl(url)) {
      toast.error("❌ Link YouTube tidak valid");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5678/webhook/youtube",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        }
      );

      const responseText = await res.text();
      console.log("Response dari n8n:", responseText);

      const newEntry = {
        url,
        status: res.ok ? "✅ berhasil" : "❌ gagal",
        timestamp: new Date().toLocaleString("id-ID"),
      };

      if (res.ok) {
        toast.success("✅ Link berhasil dikirim!", {
          description: "Tunggu beberapa saat...",
        });
        setUrl("");
      } else {
        toast.error("❌ Gagal mengirim link. Cek workflow n8n.");
      }

      setHistory((prev) => [newEntry, ...prev]);
    } catch (err) {
      toast.error("⚠️ Terjadi kesalahan saat menghubungi server");
      console.error("Error:", err);

      setHistory((prev) => [
        {
          url,
          status: "❌ error",
          timestamp: new Date().toLocaleString("id-ID"),
        },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Link ke hasil Google Drive dan Google Sheets
  const driveUrl = "https://drive.google.com/drive/folders/1HELuHCkm3h6S_NA3w7SpgORrJ5xe_pQM?hl=ID";
  const sheetUrl = "https://docs.google.com/spreadsheets/d/1gEx_2wBqVt_kZWuPj7FG0OTsTFY5UqHSvnmrCAWWAiQ/edit?gid=0#gid=0";

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={2}>
      <Card sx={{ width: 500, position: "relative", overflow: "visible" }}>
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              bgcolor: "rgba(255,255,255,0.7)",
              zIndex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <CardContent>
          <form onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom>
              Link Video YouTube
            </Typography>
            <TextField
              fullWidth
              label="https://youtube.com/watch?v=..."
              variant="outlined"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? "Memproses..." : "Kirim ke n8n"}
            </Button>
          </form>

          <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1">Riwayat Kiriman</Typography>
            <Box>
              <Tooltip title="Lihat di Google Drive">
                <IconButton onClick={() => window.open(driveUrl, "_blank")}>
                  <Folder />
                </IconButton>
              </Tooltip>
              <Tooltip title="Lihat di Google Sheets">
                <IconButton onClick={() => window.open(sheetUrl, "_blank")}>
                  <FileSpreadsheet />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <List dense sx={{ maxHeight: 200, overflowY: "auto", mt: 1 }}>
            {history.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Belum ada riwayat.
              </Typography>
            )}
            {history.map((item, i) => (
              <ListItem key={i} disablePadding>
                <ListItemText
                  primary={`${item.status} - ${item.url}`}
                  secondary={item.timestamp}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
