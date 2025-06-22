import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, TrendingUp } from "lucide-react";

export function TierExplanation() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Info className="w-5 h-5" />
          <span>Understanding Tiers vs Levels</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Levels</span>
              <Badge variant="outline">Individual Progress</Badge>
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Gained through XP from habit completions</li>
              <li>• Increase quickly with consistent practice</li>
              <li>• Affected by habit difficulty and streaks</li>
              <li>• Show immediate progress recognition</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center space-x-2">
              <span className="text-purple-600">👑</span>
              <span>Tiers</span>
              <Badge variant="outline">Mastery Recognition</Badge>
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Measure long-term consistency and skill</li>
              <li>• Consider difficulty level of habits</li>
              <li>• Require sustained performance over time</li>
              <li>• Bronze → Silver → Gold → Platinum → Diamond</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Balanced Tier Requirements (5 Tiers Total)</h4>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <div className="text-center">
              <div className="font-semibold text-orange-600">Bronze</div>
              <div>Starting point</div>
              <div>Level 1+</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-slate-600">Silver</div>
              <div>Level 3+</div>
              <div>35% completion</div>
              <div>3+ day streak</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-yellow-600">Gold</div>
              <div>Level 6+</div>
              <div>50% completion</div>
              <div>7+ day streak</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-600">Platinum</div>
              <div>Level 10+</div>
              <div>60% completion</div>
              <div>14+ day streak</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-600">Diamond</div>
              <div>Level 15+</div>
              <div>70% completion</div>
              <div>21+ day streak</div>
            </div>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-3">
            Consistency = (Longest Streak ÷ Total Completions) × 100. Higher difficulty habits have stricter tier requirements.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}