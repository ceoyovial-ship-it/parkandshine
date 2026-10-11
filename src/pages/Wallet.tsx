import { useCallback, useEffect } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  CircleHelp,
  Coins,
  Crown,
  Gift,
  LockKeyhole,
  Sparkles,
  Wallet as WalletIcon,
} from 'lucide-react';
import type { WalletAccount, WalletTransaction } from '@/types';
import { ensureDemoWallet, getWalletAccount, redeemDemoReward } from '@/store';
import { useStoreData } from '@/hooks/useStoreData';
import { useToast } from '@/components/Toast';

interface WalletProps {
  userId: string;
}

const REWARDS = [
  {
    id: 'wash-discount',
    title: '₹50 Wash Discount',
    description: 'A demo coupon to use toward a future wash booking.',
    points: 200,
    icon: Gift,
  },
  {
    id: 'wallet-credit',
    title: '₹100 Demo Wallet Credit',
    description: 'Adds demo-only credit to your ParkShine wallet balance.',
    points: 400,
    icon: WalletIcon,
  },
] as const;

const EARN_WAYS = [
  { title: 'Complete a wash', detail: 'Earn demo reward points when a booking is completed.', points: '+50 pts' },
  { title: 'Choose a premium package', detail: 'Premium Wash and Signature Detailing show sample bonus rewards.', points: '+30–60 pts' },
  { title: 'Reach a loyalty milestone', detail: 'A sample bonus celebrates every fifth completed wash.', points: '+100 pts' },
];

export default function Wallet({ userId }: WalletProps) {
  const { toast } = useToast();
  const fetchWallet = useCallback(() => getWalletAccount(userId), [userId]);
  const [wallet, refreshWallet] = useStoreData<WalletAccount>(fetchWallet);
  useEffect(() => ensureDemoWallet(userId), [userId]);
  const tier = wallet.lifetimePoints >= 2500 ? 'Platinum' : wallet.lifetimePoints >= 1000 ? 'Gold' : 'Silver';
  const nextTierPoints = tier === 'Silver' ? 1000 : tier === 'Gold' ? 2500 : 2500;
  const nextTierLabel = tier === 'Silver' ? 'Gold' : 'Platinum';
  const tierProgress = tier === 'Platinum' ? 100 : Math.min(100, (wallet.lifetimePoints / nextTierPoints) * 100);
  const nextRewardPoints = 400;
  const rewardProgress = Math.min(100, (wallet.points / nextRewardPoints) * 100);

  const handleRedeem = (rewardId: string, title: string) => {
    try {
      redeemDemoReward(userId, rewardId);
      refreshWallet();
      toast(`${title} redeemed with demo reward points.`, 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Unable to redeem this reward.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-navy pb-20">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 flex items-center gap-2 text-sm font-medium text-cyan-300">
              <Sparkles className="h-4 w-4" /> ParkShine Rewards
            </p>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Wallet & Rewards</h1>
            <p className="mt-1 text-sm text-white/50">Your demo wallet and loyalty rewards, all in one place.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-xs font-medium text-cyan-100/80">
            <LockKeyhole className="h-3.5 w-3.5" /> Demo only · No real money
          </span>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <section className="relative overflow-hidden rounded-3xl border border-cyan-200/20 bg-gradient-to-br from-brand via-blue-700 to-navy-light p-6 shadow-xl shadow-blue-950/30 sm:p-8 lg:col-span-3">
            <div className="absolute -right-8 -top-10 h-48 w-48 rounded-full border-[24px] border-white/5" />
            <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-cyan-300/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-medium text-white/75">
                  <WalletIcon className="h-5 w-5 text-cyan-200" /> Available demo balance
                </p>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">Demo wallet</span>
              </div>
              <p className="mt-5 text-sm font-medium text-white/60">Wallet balance</p>
              <p className="mt-1 text-4xl font-bold tracking-tight text-white sm:text-5xl">₹{wallet.balance.toLocaleString('en-IN')}</p>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/65">
                Demo credits only. This balance is not cash, is not withdrawable, and cannot be used to process a real payment.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-navy-light p-5 sm:p-6 lg:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white/55">Reward points available</p>
                <p className="mt-1 text-3xl font-bold text-white">{wallet.points.toLocaleString('en-IN')} <span className="text-base font-semibold text-cyan-300">pts</span></p>
                <p className="mt-1 text-xs text-white/40">{wallet.lifetimePoints.toLocaleString('en-IN')} total points earned · demo</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-300">
                <Crown className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-2 flex justify-between gap-2 text-xs">
                <span className="font-medium text-white/75">{tier} tier</span>
                <span className="text-white/40">
                  {tier === 'Platinum' ? 'Top rewards tier reached' : `${wallet.lifetimePoints} / ${nextTierPoints} pts to ${nextTierLabel}`}
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-label={`Progress toward ${nextTierLabel} tier`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(tierProgress)}
              >
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-brand transition-all" style={{ width: `${tierProgress}%` }} />
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-white/45">
                <Coins className="h-3.5 w-3.5 text-cyan-300" />
                {wallet.points >= nextRewardPoints ? 'You have enough points for the next demo reward.' : `${nextRewardPoints - wallet.points} more points to the next reward.`}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${rewardProgress}%` }} />
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <section className="space-y-4 lg:col-span-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">Redeem rewards</h2>
                <p className="mt-1 text-xs text-white/45">Redeeming updates demo points and the demo wallet only.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {REWARDS.map((reward) => {
                const Icon = reward.icon;
                const redeemed = wallet.redeemedRewardIds.includes(reward.id);
                const enoughPoints = wallet.points >= reward.points;
                return (
                  <article key={reward.id} className="flex flex-col rounded-2xl border border-white/10 bg-navy-light p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-cyan-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/70">{reward.points} pts</span>
                    </div>
                    <h3 className="mt-4 font-semibold text-white">{reward.title}</h3>
                    <p className="mt-1 flex-1 text-sm leading-relaxed text-white/50">{reward.description}</p>
                    <button
                      type="button"
                      onClick={() => handleRedeem(reward.id, reward.title)}
                      disabled={redeemed || !enoughPoints}
                      className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
                    >
                      {redeemed ? <><Check className="h-4 w-4" /> Redeemed</> : enoughPoints ? 'Redeem' : 'Not enough points'}
                    </button>
                  </article>
                );
              })}
            </div>
            <div className="rounded-xl border border-cyan-300/10 bg-cyan-300/5 p-3 text-xs leading-relaxed text-cyan-100/65">
              <CircleHelp className="mr-1 inline h-3.5 w-3.5" />
              Rewards and points are prototype data. They do not create a real coupon, payment, or wallet credit.
            </div>
          </section>

          <section className="space-y-4 lg:col-span-2">
            <div>
              <h2 className="text-lg font-bold text-white">Ways to earn</h2>
              <p className="mt-1 text-xs text-white/45">Sample rewards guide · earning is not connected to booking completion yet.</p>
            </div>
            <div className="space-y-3">
              {EARN_WAYS.map((way) => (
                <article key={way.title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-navy-light p-4">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                    <ArrowDownLeft className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white">{way.title}</h3>
                      <span className="text-xs font-semibold text-emerald-300">{way.points}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-white/45">{way.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-navy-light">
          <div className="flex flex-wrap items-end justify-between gap-2 border-b border-white/10 px-4 py-4 sm:px-5">
            <div>
              <h2 className="font-bold text-white">Wallet activity</h2>
              <p className="mt-1 text-xs text-white/45">Demo transactions only · no payment processing</p>
            </div>
            <span className="text-xs text-white/40">{wallet.transactions.length} transactions</span>
          </div>
          {wallet.transactions.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-white/45">No wallet transactions yet.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {wallet.transactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: WalletTransaction }) {
  const isCredit = transaction.amount.startsWith('+');
  const Icon = isCredit ? ArrowDownLeft : ArrowUpRight;
  return (
    <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isCredit ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-300/10 text-amber-300'}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{transaction.description}</p>
        <p className="mt-1 text-xs text-white/40">{new Date(transaction.date).toLocaleDateString('en-IN')} · {transaction.type}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`text-sm font-semibold ${isCredit ? 'text-emerald-300' : 'text-white/80'}`}>{transaction.amount}</p>
        <span className="mt-1 inline-block rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/40">{transaction.status}</span>
      </div>
    </div>
  );
}
