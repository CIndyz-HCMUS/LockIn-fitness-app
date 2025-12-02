// src/pages/OnboardingPage.tsx
import React, { useMemo, useState } from "react";
import { authService } from "../services/authService";

interface OnboardingPageProps {
  username: string;
  password: string;
  onDone: () => void;
}

const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const OnboardingPage: React.FC<OnboardingPageProps> = ({
  username,
  password,
  onDone,
}) => {
  const [displayName, setDisplayName] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");
  const [goal, setGoal] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [calorieAdjustMode, setCalorieAdjustMode] = useState<
    "none" | "deficit" | "surplus"
  >("none");
  const [calorieAdjustAmount, setCalorieAdjustAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const w = Number(weight);
  const h = Number(height);
  const tw = Number(targetWeight);
  const adjust = Number(calorieAdjustAmount) || 0;

  // ===== CALC =====
  const bmi = useMemo(() => {
    if (w > 0 && h > 0) {
      const hm = h / 100;
      return w / (hm * hm);
    }
    return null;
  }, [w, h]);

  const targetBmi = useMemo(() => {
    if (tw > 0 && h > 0) {
      const hm = h / 100;
      return tw / (hm * hm);
    }
    return null;
  }, [tw, h]);

  const bmr = useMemo(() => {
    if (!gender || w <= 0 || h <= 0) return null;
    const age = 25; // sau này nếu cần thì thêm tuổi thật
    if (gender === "male") {
      return 88.36 + 13.4 * w + 4.8 * h - 5.7 * age;
    }
    if (gender === "female") {
      return 447.6 + 9.2 * w + 3.1 * h - 4.3 * age;
    }
    return null;
  }, [gender, w, h]);

  const tdee = useMemo(() => {
    if (!bmr || !activityLevel) return null;
    return bmr * (activityMultipliers[activityLevel] || 1.2);
  }, [bmr, activityLevel]);

  const suggestedCalories = useMemo(() => {
    if (!tdee) return null;
    if (calorieAdjustMode === "deficit") return tdee - adjust;
    if (calorieAdjustMode === "surplus") return tdee + adjust;
    return tdee;
  }, [tdee, calorieAdjustMode, adjust]);

  const unhealthyTarget =
    targetBmi !== null && !isNaN(targetBmi) && targetBmi < 17.5;

  const caloriesBelowBmr =
    bmr !== null &&
    suggestedCalories !== null &&
    suggestedCalories < bmr - 1;

  // ===== SUBMIT =====
  const handleFinish = async () => {
    setError("");

    if (!username || !password) {
      setError("Thiếu username hoặc mật khẩu từ bước đăng ký.");
      return;
    }
    if (!displayName || !weight || !height || !gender) {
      setError("Please fill all required fields.");
      return;
    }
    if (unhealthyTarget) {
      setError("Your target BMI is too low. Please adjust target weight.");
      return;
    }
    if (caloriesBelowBmr) {
      setError(
        "You shouldn't consume calories below your BMR. Lower your deficit or raise your activity level."
      );
      return;
    }

    const body = {
      displayName,
      weightKg: w,
      heightCm: h,
      gender,
      goal,
      targetWeightKg: tw || undefined,
      activityLevel,
      calorieAdjustMode,
      calorieAdjustAmount: adjust || undefined,
      bmr: bmr || undefined,
      tdee: tdee || undefined,
      suggestedCalories:
        suggestedCalories && suggestedCalories > 0
          ? suggestedCalories
          : undefined,
    };

    try {
      setLoading(true);
      const res = await authService.register(username, password, body);
      console.log("onboarding register result:", res);
      if (!res || res.ok === false) {
        setError(res?.error || "Đăng ký thất bại.");
        return;
      }
      onDone();
    } catch (e) {
      console.error(e);
      setError("Có lỗi xảy ra khi hoàn tất đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  // ===== UI =====
  return (
    <div style={pageWrapperStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Get Started</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input
            label="How should we call you?"
            value={displayName}
            onChange={setDisplayName}
          />

          {/* Weight + height */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Input
              label="Your weight?"
              type="number"
              value={weight}
              onChange={setWeight}
              suffix="kg"
            />
            <Input
              label="Your height?"
              type="number"
              value={height}
              onChange={setHeight}
              suffix="cm"
            />
          </div>

          <Select
            label="Your gender?"
            value={gender}
            onChange={setGender}
            options={[
              { value: "", label: "Select your gender" },
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ]}
          />

          <Select
            label="What is your goal?"
            value={goal}
            onChange={setGoal}
            options={[
              { value: "", label: "Select your goal" },
              { value: "lose", label: "Lose weight" },
              { value: "gain", label: "Gain weight" },
              { value: "maintain", label: "Maintain weight" },
            ]}
          />

          {/* Target weight + activity level */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Input
              label="What is your target weight?"
              type="number"
              value={targetWeight}
              onChange={setTargetWeight}
              suffix="kg"
            />
            <Select
              label="What is your active level?"
              value={activityLevel}
              onChange={setActivityLevel}
              options={[
                { value: "", label: "Select your activity level" },
                { value: "sedentary", label: "Sedentary" },
                { value: "light", label: "Light active" },
                { value: "moderate", label: "Moderately active" },
                { value: "active", label: "Active" },
                { value: "very_active", label: "Very active" },
              ]}
            />
          </div>

          {/* BMI / BMR / TDEE info */}
          <div style={{ fontSize: 13, lineHeight: 1.4 }}>
            {bmi !== null && (
              <div>
                Your current BMI is <b>{bmi.toFixed(1)}</b>
              </div>
            )}
            {targetBmi !== null && (
              <div>
                Your target BMI is <b>{targetBmi.toFixed(1)}</b>
              </div>
            )}
            {unhealthyTarget && (
              <div style={{ color: "red" }}>
                Your BMI shouldn&apos;t be under about 17.5. Please adjust your
                target weight.
              </div>
            )}
            {bmr && (
              <div>
                Your BMR is <b>{Math.round(bmr)}</b> kcal
              </div>
            )}
            {tdee && (
              <div>
                Your TDEE is <b>{Math.round(tdee)}</b> kcal
              </div>
            )}
          </div>

          {/* Calorie adjust */}
          <div>
            <div style={{ marginBottom: 4 }}>
              How much calories a day do you want to adjust?
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <select
                value={calorieAdjustMode}
                onChange={(e) =>
                  setCalorieAdjustMode(
                    e.target.value as "none" | "deficit" | "surplus"
                  )
                }
                style={selectInputStyle}
              >
                <option value="none">No adjust</option>
                <option value="deficit">Calorie deficit</option>
                <option value="surplus">Calorie surplus</option>
              </select>
              <input
                type="number"
                placeholder="Enter the amount you want"
                value={calorieAdjustAmount}
                onChange={(e) => setCalorieAdjustAmount(e.target.value)}
                style={textInputStyle}
              />
            </div>
            {suggestedCalories && (
              <div style={{ marginTop: 6, fontSize: 13 }}>
                Suggested daily calories:{" "}
                <b>{Math.round(suggestedCalories)}</b> kcal
              </div>
            )}
            {caloriesBelowBmr && (
              <div style={{ marginTop: 4, fontSize: 12, color: "red" }}>
                You shouldn&apos;t consume calories below your BMR. Lower your
                deficit or raise your activity level
              </div>
            )}
          </div>

          {error && (
            <div style={{ color: "red", fontSize: 13 }}>{error}</div>
          )}

          <button
            type="button"
            onClick={handleFinish}
            disabled={loading}
            style={primaryButtonStyle}
          >
            {loading ? "Finishing..." : "Finish setup"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== Styles & small components =====

const pageWrapperStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(to bottom, #6a89cc, #dcdde1)",
  padding: 20,
};

const cardStyle: React.CSSProperties = {
  width: 480,
  maxWidth: "100%",
  maxHeight: "90vh",
  overflowY: "auto",
  overflowX: "hidden",
  background: "#fff",
  padding: "28px 26px",
  borderRadius: 18,
  boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
  boxSizing: "border-box",
};

const textInputStyle: React.CSSProperties = {
  flex: 1,
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #ccc",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const selectInputStyle: React.CSSProperties = {
  ...textInputStyle,
  appearance: "none",
};

const primaryButtonStyle: React.CSSProperties = {
  marginTop: 8,
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  background: "#1976d2",
  color: "#fff",
  fontWeight: 600,
  width: "100%",
};

const Input: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  suffix?: string;
}> = ({ label, value, onChange, type = "text", suffix }) => (
  <label
    style={{
      display: "flex",
      flexDirection: "column",
      flex: 1,
      minWidth: 0,
    }}
  >
    <div style={{ marginBottom: 4 }}>{label}</div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid #ccc",
        borderRadius: 8,
        padding: "6px 10px",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          fontSize: 14,
        }}
      />
      {suffix && (
        <span
          style={{
            marginLeft: 6,
            color: "#555",
            fontSize: 13,
            whiteSpace: "nowrap",
          }}
        >
          {suffix}
        </span>
      )}
    </div>
  </label>
);

const Select: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => (
  <label
    style={{
      display: "flex",
      flexDirection: "column",
      flex: 1,
      minWidth: 0,
    }}
  >
    <div style={{ marginBottom: 4 }}>{label}</div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={selectInputStyle}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </label>
);

export default OnboardingPage;
