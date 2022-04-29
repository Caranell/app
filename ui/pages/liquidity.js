import {
  TrendingUpIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  CalculatorIcon,
} from '@heroicons/react/outline'
import { ethers } from 'ethers'
import { useState } from 'react'
import { useBalancerPool } from '../lib/balancer'
import {
  balancerPoolId,
  balancerLPToken,
  lpRewardsContract,
  veNationRewardsMultiplier,
} from '../lib/config'
import {
  useLiquidityRewards,
  usePoolTokenBalance,
  useVeNationBoost,
  useDeposit,
  useWithdraw,
  useWithdrawAndClaim,
  useClaimRewards,
} from '../lib/liquidity-rewards'
import { transformNumber } from '../lib/numbers'
import { useAccount } from '../lib/use-wagmi'
import { useVeNationBalance, useVeNationSupply } from '../lib/ve-token'
import ActionButton from '../components/ActionButton'
import Balance from '../components/Balance'
import GradientLink from '../components/GradientLink'
import Head from '../components/Head'
import MainCard from '../components/MainCard'

export default function Liquidity() {
  const [{ data: account }] = useAccount()

  const [{ data: veNationBalance, loading: veNationBalanceLoading }] =
    useVeNationBalance(account?.address)
  const [{ poolValue, nationPrice, loadingPool }] =
    useBalancerPool(balancerPoolId)
  const [{ data: poolTokenBalance, loading: poolTokenBalanceLoading }] =
    usePoolTokenBalance(account?.address)

  const [
    {
      liquidityRewardsAPY,
      unclaimedRewards,
      userDeposit,
      totalDeposit,
      loading: loadingLiquidityRewards,
    },
  ] = useLiquidityRewards({
    nationPrice,
    poolValue,
    address: account?.address,
  })

  const [{ data: veNationSupply }] = useVeNationSupply()

  const userVeNationBoost = useVeNationBoost({
    userDeposit,
    totalDeposit,
    userVeNation: veNationBalance,
    totalVeNation: veNationSupply,
  })

  const [depositValue, setDepositValue] = useState()
  const [withdrawalValue, setWithdrawalValue] = useState()
  const deposit = useDeposit(
    ethers.utils.parseEther(depositValue ? depositValue.toString() : '0')
  )
  const withdraw = useWithdraw(
    ethers.utils.parseEther(withdrawalValue ? withdrawalValue.toString() : '0')
  )
  const claimRewards = useClaimRewards(unclaimedRewards)
  const withdrawAndClaimRewards = useWithdrawAndClaim()
  const [activeTab, setActiveTab] = useState(0)

  const loading =
    loadingPool || poolTokenBalanceLoading || loadingLiquidityRewards

  return (
    <>
      <Head title="$NATION liquidity rewards" />

      <MainCard loading={loading} title="$NATION liquidity rewards">
        <p>
          Provide liquitity in the pool and then deposit the pool token here.{' '}
          <GradientLink
            href="https://app.balancer.fi/#/pool/0x0bf37157d30dfe6f56757dcadff01aed83b08cd600020000000000000000019a"
            text="Balancer pool"
            textSize="md"
          />
          <br />
          Get up to {veNationRewardsMultiplier}x more rewards with $veNATION.{' '}
          <GradientLink href="/lock" text="Get $veNATION" textSize="md" />
        </p>

        <div className="stats stats-vertical lg:stats-horizontal shadow my-4">
          <div className="stat">
            <div className="stat-figure">
              <CurrencyDollarIcon className="h-8 w-8" />
            </div>
            <div className="stat-title">Total liquidity</div>
            <div className="stat-value">
              <Balance
                balance={transformNumber(poolValue, 'number', 0) / 1000000}
                prefix="$"
                suffix="M"
                decimals={2}
              />
            </div>
          </div>

          <div className="stat">
            <div className="stat-figure">
              <TrendingUpIcon className="h-8 w-8" />
            </div>
            <div className="stat-title">Current APY</div>
            <div className="stat-value">
              <Balance balance={liquidityRewardsAPY} suffix="%" decimals={2} />
            </div>
          </div>
        </div>
        <div className="stats stats-vertical lg:stats-horizontal shadow mb-4">
          <div className="stat">
            <div className="stat-figure text-primary">
              <SparklesIcon className="h-8 w-8" />
            </div>
            <div className="stat-title">Your veNATION</div>
            <div className="stat-value text-primary">
              <Balance
                balance={veNationBalance}
                loading={veNationBalanceLoading}
                decimals={4}
              />
            </div>
          </div>
          <div className="stat">
            <div className="stat-figure text-secondary">
              <CalculatorIcon className="h-8 w-8" />
            </div>
            <div className="stat-title">Your boosted APY</div>
            <div className="stat-value text-secondary">
              <Balance
                balance={
                  liquidityRewardsAPY &&
                  (transformNumber(liquidityRewardsAPY, 'number', 18) /
                    10 ** 18) *
                    userVeNationBoost
                }
                suffix="%"
                decimals={2}
              />
            </div>
          </div>
        </div>
        <div className="stats stats-vertical lg:stats-horizontal shadow mb-4">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <ActionButton
                className="btn btn-primary normal-case font-medium grow"
                action={claimRewards}
              >
                Claim
              </ActionButton>
            </div>
            <div className="stat-title">Your rewards</div>
            <div className="stat-value text-primary">
              <Balance balance={unclaimedRewards} decimals={2} />
            </div>
            <div className="stat-desc">NATION tokens</div>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="tabs flex justify-center bg-white mb-4">
              <a
                className={`tab grow ${activeTab === 0 ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(0)}
              >
                Stake
              </a>
              <a
                className={`tab grow ${activeTab === 1 ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(1)}
              >
                Unstake
              </a>
            </div>

            <div className="form-control">
              {activeTab === 0 ? (
                <>
                  <p className="mb-4">
                    Available to deposit:{' '}
                    <Balance balance={poolTokenBalance?.formatted} /> LP tokens
                  </p>
                  <div className="input-group">
                    <input
                      type="number"
                      placeholder="Amount"
                      className="input input-bordered w-full"
                      value={depositValue}
                      onChange={(e) => {
                        setDepositValue(e.target.value)
                      }}
                    />
                    <button
                      className="btn btn-outline"
                      onClick={() =>
                        poolTokenBalance &&
                        setDepositValue(poolTokenBalance?.formatted)
                      }
                    >
                      Max
                    </button>
                  </div>
                  <div className="card-actions mt-4">
                    <ActionButton
                      className="btn btn-primary normal-case font-medium w-full"
                      action={deposit}
                      approval={{
                        token: balancerLPToken,
                        spender: lpRewardsContract,
                        amountNeeded: depositValue,
                        approveText: 'Approve LP token',
                      }}
                    >
                      Deposit
                    </ActionButton>
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-4">
                    Available to withdraw: <Balance balance={userDeposit} /> LP
                    tokens
                  </p>
                  <div className="input-group">
                    <input
                      type="number"
                      placeholder="Amount"
                      className="input input-bordered w-full"
                      value={withdrawalValue}
                      onChange={(e) => {
                        setWithdrawalValue(e.target.value)
                      }}
                    />
                    <button
                      className="btn btn-outline"
                      onClick={() =>
                        stakingBalance && setWithdrawalValue(stakingBalance)
                      }
                    >
                      Max
                    </button>
                  </div>
                  <div className="card-actions mt-4">
                    <ActionButton
                      className="btn btn-primary normal-case font-medium w-full"
                      action={withdraw}
                    >
                      Withdraw
                    </ActionButton>
                    <ActionButton
                      className="btn btn-primary normal-case font-medium w-full"
                      action={withdrawAndClaimRewards}
                    >
                      Withdraw all and claim
                    </ActionButton>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </MainCard>
    </>
  )
}
